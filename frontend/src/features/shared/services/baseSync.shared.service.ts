import { db } from "@/features/storage";
import { isOnline } from "@/lib/utils";
import type {
  SyncEntity,
  SyncEvent,
  SyncEventType,
} from "@/features/shared/types/index.shared";

export abstract class BaseSyncQueueService {
  /** Each subclass declares which entity type it handles. */
  protected abstract readonly entityType: SyncEntity;

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
      globalThis.dispatchEvent(new CustomEvent("noteqo:trigger-sync"));
    }
  }

  getUpdatedAt(): string {
    return new Date().toISOString();
  }

  /**
   * Process a single sync event — encrypt and send to API.
   * Implemented by each entity-specific subclass.
   */
  public abstract processEvent(event: SyncEvent): Promise<void>;
}
