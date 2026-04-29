export interface MediaResponseDto {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  createdAt: string; // serialized as ISO string from API
}

export interface UploadMediaPayload {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
  // plus the file as multipart/form-data
}
