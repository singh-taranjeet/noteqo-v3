import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSpaceDto {
  @IsString()
  @IsNotEmpty()
  encryptedName: string; // base64
}
