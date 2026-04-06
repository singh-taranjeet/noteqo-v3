import { NOTE_TYPE } from '../constants/notes.constants';

export type NoteType = (typeof NOTE_TYPE)[keyof typeof NOTE_TYPE];

export interface Note {
  id: string;
  ciphertext: string;
  version: number;
  spaceId: string;
  type: NoteType;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}
