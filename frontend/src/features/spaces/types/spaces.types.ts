import type { RemoteNote } from "@/features/workspace/types/workspace.types";

export type SpaceType = "personal" | "shared";

export interface Space {
  id: string;
  name: string; // decrypted client-side
  description?: string; // decrypted client-side
  type: SpaceType;
  isDefault: boolean;
  spaceKey: string; // base64 AES key — cached locally, never sent to server
  createdAt: string;
  updatedAt: string;
}

export interface RemoteSpace {
  id: string;
  encryptedName: string; // base64 from server
  encryptedDescription?: string; // base64 from server
  type: SpaceType;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  members?: RemoteSpaceMember[];
  keySlots?: RemoteSpaceKeySlot[];
  notes: RemoteNote[];
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
  updatedAt: string;
}

export type SpaceSyncStatus = "pending" | "synced" | "failed";
export type SpaceSyncEventType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "RESTORE"
  | "PERMANENT_DELETE";
export interface SpaceSyncEvent {
  id: string;
  type: SpaceSyncEventType;
  entity: "space";
  entityId: string;
  payload: unknown;
  syncStatus: SpaceSyncStatus;
  retryCount: number;
  createdAt: string;
}
