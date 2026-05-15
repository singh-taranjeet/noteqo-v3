import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsInt,
} from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  ciphertext: string; // base64 payload

  @IsInt()
  @IsNotEmpty()
  baseVersion: number; // version the client was editing from

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
