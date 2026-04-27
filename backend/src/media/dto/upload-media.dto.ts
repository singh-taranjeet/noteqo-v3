import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadMediaDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  noteId: string;

  @IsUUID()
  @IsNotEmpty()
  spaceId: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  sizeBytes: number;
}
