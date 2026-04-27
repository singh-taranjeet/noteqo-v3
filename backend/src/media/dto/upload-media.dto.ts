import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';

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

  @IsNumber()
  @IsNotEmpty()
  sizeBytes: number;
}
