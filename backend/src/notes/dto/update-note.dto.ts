import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  ciphertext: string; // base64 payload
}
