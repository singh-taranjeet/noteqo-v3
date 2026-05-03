export class MediaResponseDto {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  meta: string | null;
  createdAt: Date;
}
