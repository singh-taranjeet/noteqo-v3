import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  ciphertext: string; // base64

  @IsString()
  @IsNotEmpty()
  encryptedNoteKey: string; // base64
}
