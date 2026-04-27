import { IsString, IsNotEmpty, IsUUID, IsIn, IsDateString } from 'class-validator';
import { NOTE_TYPE } from '../constants/notes.constants';
import type { NoteType } from '../types/notes.types';

export class CreateNoteDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  ciphertext: string; // base64 — AES-GCM(spaceKey, notePayload)

  @IsUUID()
  @IsNotEmpty()
  spaceId: string;

  @IsIn(Object.values(NOTE_TYPE))
  @IsNotEmpty()
  type: NoteType; // 'private' | 'shared'

  @IsString()
  @IsNotEmpty()
  createdAt: Date;

  @IsDateString()
  @IsNotEmpty()
  updatedAt: Date;
}
