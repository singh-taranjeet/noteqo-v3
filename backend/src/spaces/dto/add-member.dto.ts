import { IsString, IsNotEmpty, IsEmail, IsIn } from 'class-validator';
import { SPACE_ROLE } from '../constants/spaces.constants';

export class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  encryptedSpaceKey: string; // base64 — RSA(spaceKey, memberPublicKey)

  @IsIn(Object.values(SPACE_ROLE))
  @IsNotEmpty()
  role: string;
}
