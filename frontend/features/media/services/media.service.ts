import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces/services/space.service";
import { apiClient } from "@/services/api";
import { MEDIA_CONFIG, MEDIA_MESSAGES } from "../constants/media.constants";
import type { MediaResponseDto } from "../types/media.types";

export const mediaService = {
  /**
   * Encrypts and uploads a file to the backend.
   */
  async uploadMedia(
    file: File,
    spaceId: string,
    noteId: string,
  ): Promise<MediaResponseDto> {
    if (file.size > MEDIA_CONFIG.MAX_FILE_SIZE_BYTES) {
      throw new Error(MEDIA_MESSAGES.FILE_TOO_LARGE);
    }

    const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
    if (!spaceKeyBase64) {
      throw new Error("Space key not found for encryption");
    }

    const arrayBuffer = await file.arrayBuffer();
    const encryptedBlob = await cryptoService.encryptBuffer(
      arrayBuffer,
      spaceKeyBase64,
    );

    const formData = new FormData();
    formData.append(MEDIA_CONFIG.UPLOAD_FIELD_NAME, encryptedBlob);
    formData.append("id", globalThis.crypto.randomUUID());
    formData.append("noteId", noteId);
    formData.append("spaceId", spaceId);
    formData.append("mimeType", file.type || "application/octet-stream");
    formData.append("sizeBytes", file.size.toString());

    const response = await apiClient.postForm<Record<string, unknown>>(
      "/media",
      formData,
      { auth: true },
    );

    // Robustly handle if response is wrapped by ResponseTransformInterceptor or returned directly
    const data = (response?.data as Record<string, unknown>) || response;

    if (!data || typeof data.url !== "string") {
      throw new Error(
        "Invalid response format from server. Media URL is missing: " +
          JSON.stringify(response),
      );
    }

    return data as unknown as MediaResponseDto;
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
