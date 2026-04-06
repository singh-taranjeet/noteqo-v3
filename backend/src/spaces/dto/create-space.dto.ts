import { IsString, IsNotEmpty, IsUUID, IsIn } from 'class-validator';
import { SPACE_TYPE } from '../constants/spaces.constants';

export class CreateSpaceDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  encryptedName: string; // base64 — AES-GCM(spaceKey, spaceName)

  @IsIn(Object.values(SPACE_TYPE))
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  ownerKeySlot: string; // base64 — RSA(spaceKey, ownerPublicKey), always required
}
