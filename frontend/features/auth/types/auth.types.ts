import { BaseEntity } from '@/types';

export interface RegisterRequestPayload {
  email: string;
  authCredential: string; // The password text (which gets bcrypted by the backend)
  name: string;
  publicKey?: string;
  privateKey?: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  publicKey?: string | null;
  privateKey?: string | null;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
}
