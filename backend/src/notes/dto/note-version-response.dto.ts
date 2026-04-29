

export class NoteVersionResponseDto {
  id: string;
  noteId: string;
  version: number;
  ciphertext: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}
