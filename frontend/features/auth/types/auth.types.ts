import type { BaseEntity } from "@/types";

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

export interface LoginRequestPayload {
  email: string;
  authCredential: string;
}

export interface AuthResponse {
  data: {
    user: User;
    accessToken?: string;
  };
}
