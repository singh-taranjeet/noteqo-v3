import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  ciphertext: string; // base64 payload

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsDateString()
  @IsNotEmpty()
  updatedAt: Date;
}
