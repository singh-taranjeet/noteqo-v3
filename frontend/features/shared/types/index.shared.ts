export type SyncStatus = "pending" | "synced" | "failed";
export type SyncEventType =
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "RESTORE"
    | "PERMANENT_DELETE";

export type SyncEntity = "note" | "space" | "media";

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
    INTERVAL_MS: 3000,
    MAX_RETRY_COUNT: 5,
    BASE_BACKOFF_MS: 3000,
    CACHE_STALE_TIME_MS: 10 * 1000,
} as const;