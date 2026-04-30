import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  ciphertext: string; // base64 payload

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsDateString()
  @IsNotEmpty()
  updatedAt: Date;
}
