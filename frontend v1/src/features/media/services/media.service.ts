import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces";
import { apiClient } from "@/services/api";
import type { DecryptedMedia, MediaResponseDto } from "../types/media.types";
import { upload } from "@vercel/blob/client";
import { storageService, STORAGE_KEYS, db } from "@/features/storage";
import { API_BASE_URL } from "@/constants/config";
import { logService } from "@/services/log.service";
import { mediaSyncQueueService } from "./media-sync-queue.service";
import { isOnline } from "@/lib/utils";

export const mediaService = {
  /**
   * Encrypts and queues a media file for upload.
   *
   * - If online: uploads immediately via Vercel Blob
   * - If offline: stores encrypted blob in Dexie pendingMediaBlobs table
   *   and enqueues a CREATE event in the sync queue
   *
   * In both cases, the original (unencrypted) file is cached locally
   * so the first render is instant.
   */
  async uploadMedia(
    file: File,
    spaceId: string,
    noteId: string,
  ): Promise<MediaResponseDto> {
    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
    if (!spaceKeyBase64) {
      throw new Error("Space key not found for encryption");
    }

    const arrayBuffer = await file.arrayBuffer();
    const encryptedBlob = await cryptoService.encryptBuffer(
      arrayBuffer,
      spaceKeyBase64,
    );

    const id = globalThis.crypto.randomUUID();
    const mimeType = file.type || "application/octet-stream";
    const sizeBytes = file.size;
    const now = new Date().toISOString();

    if (isOnline()) {
      // Online path — upload immediately
      return this.uploadMediaDirect(
        id,
        encryptedBlob,
        arrayBuffer,
        mimeType,
        sizeBytes,
        noteId,
        spaceId,
        now,
      );
    }

    // Offline path — queue for later upload
    const originalBlob = new Blob([arrayBuffer], { type: mimeType });

    await db.pendingMediaBlobs.put({
      id,
      encryptedBlob,
      originalBlob,
      mimeType,
      sizeBytes,
      noteId,
      spaceId,
      createdAt: now,
    });

    await mediaSyncQueueService.enqueue({
      type: "CREATE",
      entityId: id,
      entity: "media",
      payload: { id, noteId, spaceId, mimeType, sizeBytes },
    });

    // Return a placeholder record (URL will be filled after sync)
    return {
      id,
      noteId,
      spaceId,
      mimeType,
      sizeBytes,
      url: `pending:${id}`,
      meta: null,
      createdAt: now,
    };
  },

  /**
   * Direct upload path (when online). Encrypts and uploads to Vercel Blob,
   * caches locally, and registers with backend.
   */
  async uploadMediaDirect(
    id: string,
    encryptedBlob: Blob,
    originalBuffer: ArrayBuffer,
    mimeType: string,
    sizeBytes: number,
    noteId: string,
    spaceId: string,
    createdAt: string,
  ): Promise<MediaResponseDto> {
    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);

    const encryptedFile = new File([encryptedBlob], id, { type: mimeType });

    const blob = await upload(id, encryptedFile, {
      access: "public",
      multipart: true,
      handleUploadUrl: `${API_BASE_URL}/media/upload`,
      clientPayload: JSON.stringify({
        token,
        id,
        noteId,
        spaceId,
        mimeType,
        sizeBytes: sizeBytes.toString(),
      }),
    });

    // Write-through cache: store the original decrypted file in IndexedDB
    try {
      const decryptedBlob = new Blob([originalBuffer], { type: mimeType });
      await db.mediaBlobs.put({
        url: blob.url,
        blob: decryptedBlob,
        mimeType,
        sizeBytes,
        accessedAt: Date.now(),
      });
    } catch (cacheErr) {
      logService.warn("Failed to cache uploaded media blob locally", cacheErr);
    }

    const mediaRecord = {
      id,
      noteId,
      spaceId,
      mimeType,
      sizeBytes,
      url: blob.url,
      meta: null,
      createdAt,
    };

    // Register the media record with the backend
    try {
      await apiClient.post("/media/register", mediaRecord, { auth: true });
    } catch (err) {
      logService.warn("Failed to register media record with backend", err);
    }

    return mediaRecord;
  },

  /**
   * Fetches and decrypts a media blob with read-through local caching.
   *
   * 1. Check IndexedDB cache first → instant return on hit
   * 2. On miss: fetch encrypted blob from Vercel Blob, decrypt, cache, return
   */
  async fetchAndDecryptMedia(
    url: string,
    spaceId: string,
    mimeType: string,
  ): Promise<Blob> {
    // 1. Check local cache first
    try {
      const cached = await db.mediaBlobs.get(url);
      if (cached) {
        // Update access timestamp (non-blocking, for future LRU eviction)
        void db.mediaBlobs.update(url, { accessedAt: Date.now() });
        return new Blob([cached.blob], { type: cached.mimeType });
      }
    } catch (cacheErr) {
      // Cache read failure is non-fatal — fall through to network
      logService.warn("Failed to read media blob from local cache", cacheErr);
    }

    // 2. Cache miss — fetch from network and decrypt
    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
    if (!spaceKeyBase64) {
      throw new Error("Space key not found for decryption");
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch media blob from remote");
    }

    const encryptedBlob = await response.blob();
    const decryptedBuffer = await cryptoService.decryptBuffer(
      encryptedBlob,
      spaceKeyBase64,
    );

    const decryptedBlob = new Blob([decryptedBuffer], { type: mimeType });

    // 3. Write to cache (non-blocking)
    try {
      await db.mediaBlobs.put({
        url,
        blob: decryptedBlob,
        mimeType,
        sizeBytes: decryptedBuffer.byteLength,
        accessedAt: Date.now(),
      });
    } catch (cacheErr) {
      logService.warn("Failed to cache decrypted media blob locally", cacheErr);
    }

    return decryptedBlob;
  },

  /**
   * Fetches all media for a given space ID from remote, decrypts if necessary, and caches.
   */
  async getRemoteMediaList(spaceId: string): Promise<DecryptedMedia[]> {
    const res = await apiClient.get<{ data: MediaResponseDto[] }>(
      `/media?spaceId=${spaceId}`,
      {
        auth: true,
      },
    );

    const remoteMedia = res.data || [];

    // Cache to Dexie and return the decrypted media
    return this.cacheDecryptMediaList(spaceId, remoteMedia);
  },

  async cacheDecryptMediaList(
    spaceId: string,
    mediaList: MediaResponseDto[],
  ): Promise<DecryptedMedia[]> {
    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);

    if (!spaceKeyBase64) throw new Error("Space key not found");
    const spaceKeyBytes = new Uint8Array(
      cryptoService.decodeBase64(spaceKeyBase64),
    );

    const decryptedList = await Promise.all(
      mediaList.map(async (media) => {
        let title = "";
        let description = "";
        if (media.meta) {
          try {
            const decryptedMetaStr = await cryptoService.decryptString(
              media.meta,
              spaceKeyBytes,
            );
            const meta = JSON.parse(decryptedMetaStr);
            title = meta.title || "";
            description = meta.description || "";
          } catch (err) {
            console.error("Failed to decrypt media meta", err);
          }
        }
        return { ...media, title, description } as DecryptedMedia;
      }),
    );

    // Save to local IndexedDB cache
    if (decryptedList.length > 0) {
      await db.media.bulkPut(decryptedList);
    }

    return decryptedList;
  },

  /**
   * Fetches all media for the current user from remote, decrypts if necessary, and caches.
   */
  async getAllMediaList(spaceIds: string[]): Promise<DecryptedMedia[]> {
    const res = await apiClient.get<{ data: MediaResponseDto[] }>("/media", {
      auth: true,
    });

    let mediaList: MediaResponseDto[] = [];
    const remote = res.data || [];

    try {
      mediaList = remote.filter((m) => spaceIds.includes(m.spaceId));
    } catch (err) {
      console.warn("Falling back to local media cache for all spaces", err);
      mediaList = await mediaService.getLocalMediaListForSpaces(spaceIds);
    }

    if (!mediaList.length) return [];

    // We need to group media by spaceId so we can fetch the right spaceKey
    const mediaBySpaceId = mediaList.reduce(
      (acc, media) => {
        if (!acc[media.spaceId]) acc[media.spaceId] = [];
        acc[media.spaceId].push(media);
        return acc;
      },
      {} as Record<string, MediaResponseDto[]>,
    );

    const decryptedMediaPromises = Object.entries(mediaBySpaceId).map(
      async ([spaceId, list]) => this.cacheDecryptMediaList(spaceId, list),
    );

    const results = await Promise.all(decryptedMediaPromises);
    return results.flat();
  },

  /**
   * Gets media list from local Dexie database for multiple spaces
   */
  async getLocalMediaListForSpaces(
    spaceIds: string[],
  ): Promise<DecryptedMedia[]> {
    if (!spaceIds || spaceIds.length === 0) return [];
    return db.media
      .where("spaceId")
      .anyOf(spaceIds)
      .reverse()
      .sortBy("createdAt");
  },

  /**
   * Gets media list from local Dexie database
   */
  async getLocalMediaList(spaceId: string): Promise<DecryptedMedia[]> {
    return db.media
      .where("spaceId")
      .equals(spaceId)
      .reverse()
      .sortBy("createdAt");
  },

  /**
   * Updates meta for a media blob locally and remotely.
   */
  async updateMedia(
    mediaId: string,
    data: { meta?: string },
  ): Promise<MediaResponseDto> {
    const res = await apiClient.patch<{ data: MediaResponseDto }>(
      `/media/${mediaId}`,
      data,
      {
        auth: true,
      },
    );

    const response = res.data;
    const localMedia = await db.media.get({ id: mediaId });
    if (localMedia) {
      await this.cacheDecryptMediaList(localMedia?.spaceId, [response]);
    }
    return response;
  },

  /**
   * Delete a media blob from remote (via sync queue) and local cache.
   */
  async deleteMedia(mediaId: string, url?: string): Promise<void> {
    // Enqueue a DELETE event for the media sync queue
    await mediaSyncQueueService.enqueue({
      type: "DELETE",
      entityId: mediaId,
      entity: "media",
      payload: { id: mediaId, url },
    });

    // Immediately clean up local cache
    if (url) {
      try {
        await db.mediaBlobs.delete(url);
      } catch {
        // Non-fatal
      }
    }

    // Remove from local media metadata
    try {
      await db.media.delete(mediaId);
    } catch {
      // Non-fatal
    }
  },

  /**
   * Remove a single blob from the local cache by URL.
   */
  async removeMediaBlob(url: string): Promise<void> {
    await db.mediaBlobs.delete(url);
  },

  /**
   * Clear all cached media blobs from IndexedDB.
   * Useful for logout or manual cache clearing.
   */
  async clearMediaCache(): Promise<void> {
    await db.mediaBlobs.clear();
  },
};
