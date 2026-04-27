import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  ciphertext: string; // base64 payload

  @IsDateString()
  @IsNotEmpty()
  updatedAt: Date;
}
