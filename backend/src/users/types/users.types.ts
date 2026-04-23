export interface User {
  id: string;
  email: string;
  name: string;
  publicKey?: string;
  privateKey?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface UserWithAuth extends User {
  authCredential?: string;
}

export type UpdateUserPayload = Partial<Omit<UserWithAuth, 'id' | 'createdAt' | 'updatedAt'>>;
