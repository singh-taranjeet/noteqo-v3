import { db } from "@/features/storage";
import { cryptoService } from "@/features/crypto";
import type { SyncEvent, SyncEventType, Note } from "../types/workspace.types";
import { SYNC_CONFIG } from "../constants/workspace.constants";
import { noteApiService } from "./note-api.service";
import { spaceService } from "@/features/spaces/services/space.service";
import { isOnline } from "@/lib/utils";

/**
 * Background sync queue that processes note events (CREATE, UPDATE, DELETE).
 *
 * - Coalesces events: if a pending event for the same entity exists, it merges
 *   instead of creating duplicates.
 * - Encrypts note content via the space key before sending to the API.
 * - Deletes events from queue after successful sync.
 * - Retries with exponential backoff up to MAX_RETRY_COUNT.
 */
class SyncQueueService {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isProcessing = false;
  private onlineHandler: (() => void) | null = null;

  /**
   * Start background polling + listen for online events.
   */
  start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      void this.processQueue();
    }, SYNC_CONFIG.INTERVAL_MS);

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
  async enqueue(
    type: SyncEventType,
    entityId: string,
    payload: unknown,
  ): Promise<void> {
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
      syncStatus: "pending",
      payload,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    await db.syncQueue.put(event);
  }

  private getUpdatedAt() {
    return new Date().toISOString();
  }

  /**
   * Process all pending events in FIFO order.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    // Check if the application is online
    if (isOnline()) return;

    this.isProcessing = true;

    try {
      const events = await db.syncQueue.orderBy("createdAt").toArray();

      for (const event of events) {
        try {
          await this.processEvent(event);
          // Success — delete from queue
          await db.syncQueue.delete(event.id);
        } catch {
          const newRetryCount = event.retryCount + 1;

          if (newRetryCount >= SYNC_CONFIG.MAX_RETRY_COUNT) {
            // Max retries exceeded — delete event, mark note as failed
            await db.syncQueue.update(event.id, { syncStatus: "failed" });
          } else {
            // wait 3 seconds before trying again
            setTimeout(async () => {
              await db.syncQueue.update(event.id, {
                retryCount: newRetryCount,
              });
            }, SYNC_CONFIG.BASE_BACKOFF_MS);
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
   */
  private async processEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case "CREATE": {
        const note = event.payload as Note;
        const ciphertext = await this.encryptPayload(note);

        await noteApiService.createNote({
          id: event.entityId,
          ciphertext,
          spaceId: note.spaceId,
          type: note.type,
          isFavorite: note.isFavorite,
          parentId: note.parentId,
          createdAt: note.createdAt,
          updatedAt: this.getUpdatedAt(),
        });
        break;
      }

      case "UPDATE": {
        const note = event.payload as Note;
        const ciphertext = await this.encryptPayload(note);
        await noteApiService.updateNote({
          id: event.entityId,
          ciphertext,
          isFavorite: note.isFavorite,
          parentId: note.parentId,
          updatedAt: this.getUpdatedAt(),
        });
        break;
      }

      case "DELETE": {
        await noteApiService.deleteNote(event.entityId);
        break;
      }

      case "RESTORE": {
        await noteApiService.restoreNote(event.entityId);
        break;
      }

      case "PERMANENT_DELETE": {
        await noteApiService.permanentDeleteNote(event.entityId);
        break;
      }
    }
  }

  /**
   * Encrypt a note payload using the space key.
   *
   * 1. Resolve the space key bytes via spaceService
   * 2. Serialize the payload (title, emoji, coverImage, content) to JSON
   * 3. Encrypt with AES-GCM using cryptoService → "iv:ciphertext"
   */
  private async encryptPayload(note: Note): Promise<string> {
    const spaceKeyBytes = await spaceService.getSpaceKeyBytes(note.spaceId);

    const payloadToEncrypt = {
      title: note.title?.slice(0, 50) || "",
      emoji: note.emoji,
      coverImage: note.coverImage,
      content: note.content,
    };

    return cryptoService.encryptString(
      JSON.stringify(payloadToEncrypt),
      spaceKeyBytes,
    );
  }
}

export const syncQueueService = new SyncQueueService();
