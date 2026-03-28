export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  publicKey?: string;
  privateKey?: string;
  createdAt: Date;
  updatedAt: Date;
}
