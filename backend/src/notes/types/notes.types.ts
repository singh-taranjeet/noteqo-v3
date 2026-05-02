import { NOTE_TYPE } from '../constants/notes.constants';

export type NoteType = (typeof NOTE_TYPE)[keyof typeof NOTE_TYPE];

export interface Note {
  id: string;
  ciphertext: string;
  version: number;
  spaceId: string;
  parentId?: string | null;
  type: NoteType;
  isFavorite: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  version: number;
  ciphertext: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}
