export interface MediaResponseDto {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  meta: string | null;
  createdAt: string; // serialized as ISO string from API
}

export interface DecryptedMedia extends MediaResponseDto {
  title: string;
  description: string;
}

export interface UpdateMediaDto {
  meta?: string;
}

export interface UploadMediaPayload {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
  // plus the file as multipart/form-data
}
