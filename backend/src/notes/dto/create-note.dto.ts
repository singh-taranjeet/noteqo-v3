import { IsString, IsNotEmpty, IsUUID, IsIn } from 'class-validator';
import { NOTE_TYPE } from '../constants/notes.constants';

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
  type: string; // 'private' | 'shared'
}
