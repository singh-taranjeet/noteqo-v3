export interface User {
  id: string;
  email: string;
  name: string;
  publicKey?: string;
  privateKey?: string;
  createdAt: Date;
  updatedAt: Date;
}
