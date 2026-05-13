import { db } from "@/features/storage";
import { isOnline } from "@/lib/utils";
import type {
  SyncEntity,
  SyncEvent,
  SyncEventType,
} from "@/features/shared/types/index.shared";
import { SYNC_CONFIG } from "@/features/shared/types/index.shared";

export abstract class BaseSyncQueueService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;
  private onlineHandler: (() => void) | null = null;

  /** Each subclass declares which entity type it handles. */
  protected abstract readonly entityType: SyncEntity;

  /**
   * Start background polling + listen for online events.
   */
  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      void this.processQueue();
    }, SYNC_CONFIG.AUTO_PROCESS_MS);

    this.onlineHandler = () => void this.processQueue();
    globalThis.addEventListener("online", this.onlineHandler);
  }
  /**
   * Stop background polling.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.onlineHandler) {
      globalThis.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
    }
  }

  /**
   * Add or coalesce an event in the queue.
   *
   * Coalescing rules:
   * - CREATE + UPDATE → update the CREATE event's payload
   * - CREATE + DELETE → delete the CREATE event entirely (net zero)
   * - UPDATE + UPDATE → update the existing UPDATE event's payload
   * - UPDATE + DELETE → replace with a DELETE event
   * - Otherwise → insert new event
   */
  async enqueue(params: {
    type: SyncEventType;
    entityId: string;
    entity: SyncEntity;
    payload: unknown;
  }): Promise<void> {
    const { type, entity, entityId, payload } = params;
    const existing = await db.syncQueue
      .where("entityId")
      .equals(entityId)
      .first();

    if (existing) {
      if (existing.type === "CREATE" && type === "UPDATE") {
        // Merge into the existing CREATE — will still POST on sync
        await db.syncQueue.update(existing.id, { payload });
        return;
      }

      if (existing.type === "CREATE" && type === "DELETE") {
        // Net zero — the entity was created then deleted before syncing
        await db.syncQueue.delete(existing.id);
        return;
      }

      if (existing.type === "UPDATE" && type === "UPDATE") {
        // Update payload of existing UPDATE event
        await db.syncQueue.update(existing.id, { payload });
        return;
      }

      if (existing.type === "UPDATE" && type === "DELETE") {
        // Replace UPDATE with DELETE
        await db.syncQueue.update(existing.id, { type: "DELETE", payload });
        return;
      }
    }

    // No existing event or no coalescing rule applies — insert new
    const event: SyncEvent = {
      id: crypto.randomUUID(),
      type,
      entityId,
      entity,
      syncStatus: "pending",
      payload,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    await db.syncQueue.put(event);

    // Attempt to flush immediately if online (don't wait for next interval)
    if (isOnline()) {
      void this.prepare();
    }
  }

  getUpdatedAt(): string {
    return new Date().toISOString();
  }

  /**
   * Process all pending events for THIS entity type in FIFO order.
   * Each subclass only processes its own entity type, so a failing
   * space sync doesn't block note syncs and vice versa.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (!isOnline()) return;

    this.isProcessing = true;

    try {
      // Only process events for this subclass's entity type
      const events = await db.syncQueue
        .where("entity")
        .equals(this.entityType)
        .sortBy("createdAt");

      for (const event of events) {
        try {
          await this.processEvent(event);
          // Success — delete from queue
          await db.syncQueue.delete(event.id);
        } catch {
          const newRetryCount = event.retryCount + 1;

          if (newRetryCount >= SYNC_CONFIG.MAX_RETRY_COUNT) {
            // Max retries exceeded — mark as failed
            await db.syncQueue.update(event.id, { syncStatus: "failed" });
          } else {
            // Exponential backoff: 3s → 6s → 12s → 24s → ...
            const backoffMs =
              SYNC_CONFIG.BASE_BACKOFF_MS * Math.pow(2, event.retryCount);

            setTimeout(() => {
              void db.syncQueue.update(event.id, {
                retryCount: newRetryCount,
              });
            }, backoffMs);
          }

          // Stop processing remaining events on failure (preserve ordering)
          break;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single sync event — encrypt and send to API.
   * Implemented by each entity-specific subclass.
   */
  protected abstract processEvent(event: SyncEvent): Promise<void>;

  protected prepare() {
    if (this.isProcessing) return;

    setTimeout(() => {
      this.processQueue();
    }, SYNC_CONFIG.NEXT_INTERVAL_MS);
  }
}
