import { db } from "@/features/storage";
import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces";
import { mediaApiService } from "./media-api.service";
import type { Media } from "../types/media.types";

export const mediaService = {
  /**
   * Encrypts the file using the space key, caches the encrypted blob locally in Dexie,
   * and uploads it to the backend. Returns the final Vercel Blob URL.
   */
  async uploadMedia(
    file: File,
    noteId: string,
    spaceId: string,
    onProgress?: (event: { progress: number }) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const id = crypto.randomUUID();

    // 1. Get Space Key for encryption
    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
    if (!spaceKeyBase64) {
      throw new Error(`Could not find space key for space ${spaceId}`);
    }

    // 2. Read File as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    if (signal?.aborted) throw new Error("Upload cancelled");
    onProgress?.({ progress: 10 });

    // 3. Encrypt the file using AES-GCM
    const encryptedBlob = await cryptoService.encryptBuffer(
      arrayBuffer,
      spaceKeyBase64,
    );

    if (signal?.aborted) throw new Error("Upload cancelled");
    onProgress?.({ progress: 40 });

    // 4. Upload to Backend
    const response = await mediaApiService.upload({
      id,
      noteId,
      spaceId,
      mimeType: file.type,
      sizeBytes: file.size, // Original file size
      file: encryptedBlob,
    });

    if (!response || !response.url) {
      throw new Error("Failed to get URL from backend");
    }

    if (signal?.aborted) throw new Error("Upload cancelled");
    onProgress?.({ progress: 90 });

    // 5. Save local metadata record
    const mediaRecord: Media = {
      id,
      noteId,
      spaceId,
      mimeType: file.type,
      sizeBytes: file.size,
      url: response.url,
      createdAt: response.createdAt,
      syncStatus: "synced",
    };

    await db.media.put(mediaRecord);

    onProgress?.({ progress: 100 });
    return response.url;
  },

  /**
   * Fetches the encrypted blob from Vercel CDN and decrypts it locally.
   * Returns a local object URL (blob:) that can be used in an <img> tag.
   */
  async getDecryptedMediaUrl(url: string, spaceId: string): Promise<string> {
    // 1. Get Space Key for decryption
    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
    if (!spaceKeyBase64) {
      throw new Error(`Could not find space key for space ${spaceId}`);
    }

    // 2. Fetch the encrypted blob directly from Vercel URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch encrypted media from CDN");
    }
    const encryptedBlob = await response.blob();

    // 3. Decrypt the blob
    const decryptedArrayBuffer = await cryptoService.decryptBuffer(
      encryptedBlob,
      spaceKeyBase64,
    );

    // 4. Create an object URL for the decrypted content
    // We guess the mime type or use a generic one, but for images generic works in modern browsers if it's rendered in an img tag
    const decryptedBlob = new Blob([decryptedArrayBuffer]);
    return URL.createObjectURL(decryptedBlob);
  },
};
