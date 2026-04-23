export type SpaceType = "personal" | "shared";

export interface Space {
  id: string;
  name: string; // decrypted client-side
  type: SpaceType;
  isDefault: boolean;
  spaceKey: string; // base64 AES key — cached locally, never sent to server
  createdAt: string;
  updatedAt: string;
}

export interface RemoteSpace {
  id: string;
  encryptedName: string; // base64 from server
  type: SpaceType;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  members?: RemoteSpaceMember[];
  keySlots?: RemoteSpaceKeySlot[];
}

export interface RemoteSpaceMember {
  userId: string;
  role: string;
  name?: string;
  email?: string;
}

export interface RemoteSpaceKeySlot {
  userId: string;
  encryptedSpaceKey: string; // base64
}

export interface SpaceNotesResponse {
  spaceId: string;
  encryptedSpaceKey: string; // base64 — the requesting user's key slot
  notes: RemoteSpaceNote[];
}

export interface RemoteSpaceNote {
  id: string;
  ciphertext: string;
  version: number;
  spaceId: string;
  type: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}
