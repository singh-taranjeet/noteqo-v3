import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces/services/space.service";
import { apiClient } from "@/services/api";
import type { MediaResponseDto } from "../types/media.types";
import { upload } from "@vercel/blob/client";
import { storageService, STORAGE_KEYS, db } from "@/features/storage";
import { API_BASE_URL } from "@/constants/config";
import { logService } from "@/services/log.service";

export const mediaService = {
  /**
   * Encrypts and uploads a file directly to Vercel Blob using a secure token.
   * After a successful upload, the original (unencrypted) file is cached
   * locally in IndexedDB so the first render is instant.
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
    const sizeBytes = file.size.toString();
    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);

    // Vercel Blob client requires a File or Blob.
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
        sizeBytes,
      }),
    });

    // Write-through cache: store the original decrypted file in IndexedDB
    // so the first render after upload is instant (no fetch + decrypt needed).
    try {
      const decryptedBlob = new Blob([arrayBuffer], { type: mimeType });
      await db.mediaBlobs.put({
        url: blob.url,
        blob: decryptedBlob,
        mimeType,
        sizeBytes: file.size,
        accessedAt: Date.now(),
      });
    } catch (cacheErr) {
      // Cache write failure is non-fatal — media will still load from network
      logService.warn("Failed to cache uploaded media blob locally", cacheErr);
    }

    return {
      id,
      noteId,
      spaceId,
      mimeType,
      sizeBytes: parseInt(sizeBytes, 10),
      url: blob.url,
      createdAt: new Date().toISOString(),
    };
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
   * Delete a media blob from remote and local cache.
   */
  async deleteMedia(mediaId: string, url?: string): Promise<void> {
    await apiClient.delete(`/media/${mediaId}`, { auth: true });

    // Also remove from local cache if URL is known
    if (url) {
      try {
        await db.mediaBlobs.delete(url);
      } catch {
        // Non-fatal
      }
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
