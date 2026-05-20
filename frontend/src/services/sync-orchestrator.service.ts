import { db } from "@/features/storage";
import { isOnline } from "@/lib/utils";
import { SYNC_CONFIG } from "@/types/sync.types";
import { SYNC_EVENTS } from "@/constants/sync-events.constants";
import { noteSyncQueueService } from "@/features/workspace/services/note-sync-queue.service";
import { spaceSyncQueueService } from "@/features/spaces";
import { mediaSyncQueueService } from "@/features/media";
import { logService } from "@/services/log.service";

class SyncOrchestrator {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;
  private onlineHandler: (() => void) | null = null;
  private triggerHandler: (() => void) | null = null;

  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      void this.processQueue();
    }, SYNC_CONFIG.AUTO_PROCESS_MS);

    this.onlineHandler = () => void this.processQueue();
    globalThis.addEventListener("online", this.onlineHandler);

    this.triggerHandler = () => void this.prepare();
    globalThis.addEventListener(SYNC_EVENTS.TRIGGER_SYNC, this.triggerHandler);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.onlineHandler) {
      globalThis.removeEventListener("online", this.onlineHandler);
      this.onlineHandler = null;
    }

    if (this.triggerHandler) {
      globalThis.removeEventListener(
        SYNC_EVENTS.TRIGGER_SYNC,
        this.triggerHandler,
      );
      this.triggerHandler = null;
    }
  }

  private prepare() {
    if (this.isProcessing) return;

    setTimeout(() => {
      void this.processQueue();
    }, SYNC_CONFIG.NEXT_INTERVAL_MS);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    if (!isOnline()) return;

    this.isProcessing = true;

    try {
      // 1. Sync dirty notes first
      await noteSyncQueueService.syncDirtyNotes();

      // 2. Fetch all pending events, strictly ordered by createdAt
      let events = await db.syncQueue.orderBy("createdAt").toArray();
      // Skip permanently failed events to avoid blocking the queue forever
      events = events.filter((e) => e.syncStatus !== "failed");

      for (const event of events) {
        try {
          // Mark as processing so new local updates don't coalesce into it
          await db.syncQueue.update(event.id, { syncStatus: "processing" });

          switch (event.entity) {
            case "note":
              await noteSyncQueueService.processEvent(event);
              break;
            case "space":
              await spaceSyncQueueService.processEvent(event);
              break;
            case "media":
              await mediaSyncQueueService.processEvent(event);
              break;
            default:
              logService.warn(`Unknown sync entity type: ${event.entity}`);
          }
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

            // Revert to pending while waiting
            await db.syncQueue.update(event.id, { syncStatus: "pending" });

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
}

export const syncOrchestrator = new SyncOrchestrator();
