export type SyncStatus = "pending" | "synced" | "failed";
export type SyncEventType = "CREATE" | "UPDATE" | "DELETE";

export interface Document {
  id: string;
  title: string;
  emoji: string;
  coverImage: string;
  content: unknown;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  docKey?: string;
}

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  entityId: string;
  payload: unknown;
  retryCount: number;
  createdAt: string;
}
