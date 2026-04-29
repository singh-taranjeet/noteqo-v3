import { MEDIA_API_ROUTES } from "../constants/media.constants";
import { storageService, STORAGE_KEYS } from "@/features/storage";
import { API_BASE_URL } from "@/constants/config";

export interface UploadMediaRequest {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
  file: Blob; // The encrypted blob
}

export interface MediaResponse {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export const mediaApiService = {
  /**
   * Uploads an encrypted media blob to the backend.
   * We use fetcher to ensure auth headers are added.
   * Since this is a multipart form upload, we build a FormData object.
   */
  async upload(request: UploadMediaRequest): Promise<MediaResponse | null> {
    const formData = new FormData();
    formData.append("id", request.id);
    formData.append("noteId", request.noteId);
    formData.append("spaceId", request.spaceId);
    formData.append("mimeType", request.mimeType);
    formData.append("sizeBytes", request.sizeBytes.toString());
    formData.append("file", request.file, request.id); // Send blob as 'file'

    // Use standard fetch but grab the token from storageService
    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);

    const response = await fetch(`${API_BASE_URL}${MEDIA_API_ROUTES.UPLOAD}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    return response.json() as Promise<MediaResponse>;
  },

  async delete(mediaId: string): Promise<void> {
    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);
    const response = await fetch(
      `${API_BASE_URL}${MEDIA_API_ROUTES.DELETE(mediaId)}`,
      {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Delete failed with status ${response.status}`);
    }
  },
};
