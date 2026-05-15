export type SyncStatus = "pending" | "processing" | "synced" | "failed";

export const SYNC_EVENT_TYPE = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  RESTORE: "RESTORE",
  PERMANENT_DELETE: "PERMANENT_DELETE",
} as const;

export type SyncEventType =
  (typeof SYNC_EVENT_TYPE)[keyof typeof SYNC_EVENT_TYPE];

export const SYNC_ENTITY = {
  NOTE: "note",
  SPACE: "space",
  MEDIA: "media",
} as const;

export type SyncEntity = (typeof SYNC_ENTITY)[keyof typeof SYNC_ENTITY];

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  entity: SyncEntity;
  entityId: string;
  payload: unknown;
  syncStatus: SyncStatus;
  retryCount: number;
  createdAt: string;
}

export const SYNC_CONFIG = {
  AUTO_PROCESS_MS: 5 * 1000, // 5 Seconds
  NEXT_INTERVAL_MS: 3 * 1000, // 3 seconds
  MAX_RETRY_COUNT: 10,
  BASE_BACKOFF_MS: 3000,
  CACHE_STALE_TIME_MS: 10 * 1000,
} as const;
