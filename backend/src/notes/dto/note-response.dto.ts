import type { NoteType } from '../types/notes.types';

export class NoteResponseDto {
  id: string;
  ciphertext: string; // base64
  version: number;
  spaceId: string;
  type: NoteType;
  isFavorite: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string | null;
}
