import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  authCredential: string; // The Bcrypt hashed output derived purely from the client

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  publicKey?: string;

  @IsString()
  @IsOptional()
  privateKey?: string;
}
