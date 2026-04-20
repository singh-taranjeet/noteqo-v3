export type SyncStatus = "pending" | "synced" | "failed";
export type SyncEventType = "CREATE" | "UPDATE" | "DELETE";

export interface Note {
  id: string;
  title: string;
  emoji: string;
  coverImage: string;
  content: unknown;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
  noteKey?: string;
}

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  entityId: string;
  payload: unknown;
  retryCount: number;
  createdAt: string;
}
