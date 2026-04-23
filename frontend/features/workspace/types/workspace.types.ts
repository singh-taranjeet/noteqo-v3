export type SyncStatus = "pending" | "synced" | "failed";
export type SyncEventType = "CREATE" | "UPDATE" | "DELETE";
export type NoteType = "private" | "shared";

export interface Note {
  id: string;
  title: string;
  emoji: string;
  coverImage: string;
  content: unknown;
  syncStatus: SyncStatus;
  spaceId: string;
  type: NoteType;
  createdAt: string;
  updatedAt: string;
}

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  entityId: string;
  payload: unknown;
  retryCount: number;
  createdAt: string;
}

export interface RemoteNote {
  id: string;
  ciphertext: string;
  version: number;
  spaceId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}
