import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces/services/space.service";
import { apiClient } from "@/services/api";
import type { MediaResponseDto } from "../types/media.types";
import { upload } from "@vercel/blob/client";
import { storageService, STORAGE_KEYS } from "@/features/storage";
import { API_BASE_URL } from "@/constants/config";

export const mediaService = {
  /**
   * Encrypts and uploads a file directly to Vercel Blob using a secure token.
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
   * Fetches the encrypted blob from the given URL and decrypts it.
   * Returns a decrypted File/Blob with the original mimeType.
   */
  async fetchAndDecryptMedia(
    url: string,
    spaceId: string,
    mimeType: string,
  ): Promise<Blob> {
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

    return new Blob([decryptedBuffer], { type: mimeType });
  },

  /**
   * Delete a media blob.
   */
  async deleteMedia(mediaId: string): Promise<void> {
    await apiClient.delete(`/media/${mediaId}`, { auth: true });
  },
};
