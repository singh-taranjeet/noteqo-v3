import { db, storageService, STORAGE_KEYS } from "@/features/storage";
import { cryptoService, CRYPTO_CONFIG } from "@/features/crypto";
import { apiClient } from "@/services/api";
import type {
  SyncEvent,
  SyncEventType,
  Note,
} from "../types/workspace.types";
import {
  SYNC_CONFIG,
  WORKSPACE_API_ROUTES,
} from "../constants/workspace.constants";
import { mergeLocalRemoteService } from "./merge-local-remote.service";

/**
 * Background sync queue that processes note events (CREATE, UPDATE, DELETE).
 *
 * - Coalesces events: if a pending event for the same entity exists, it merges
 *   instead of creating duplicates.
 * - Encrypts note content via cryptoService before sending to the API.
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

      if (existing.type === "CREATE" && type === "DELETE") {
        // Net zero — never hit the API
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
      payload,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    await db.syncQueue.put(event);
  }

  /**
   * Process all pending events in FIFO order.
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    // Check if the application is online
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    this.isProcessing = true;

    try {
      const events = await db.syncQueue.orderBy("createdAt").toArray();

      for (const event of events) {
        try {
          await this.processEvent(event);
          // Success — delete from queue
          await db.syncQueue.delete(event.id);
          // Update note syncStatus
          await db.notes.update(event.entityId, { syncStatus: "synced" });
        } catch {
          const newRetryCount = event.retryCount + 1;

          if (newRetryCount >= SYNC_CONFIG.MAX_RETRY_COUNT) {
            // Max retries exceeded — delete event, mark note as failed
            await db.syncQueue.delete(event.id);
            await db.notes.update(event.entityId, { syncStatus: "failed" });
          } else {
            // wait 3 seconds before trying again
            setTimeout(async () => {
              await db.syncQueue.update(event.id, { retryCount: newRetryCount });
            }, SYNC_CONFIG.BASE_BACKOFF_MS);
          }

          // Stop processing remaining events on failure (preserve ordering)
          break;
        }
      }
    } finally {
      this.isProcessing = false;
      mergeLocalRemoteService.merge();
    }
  }

  /**
   * Process a single sync event — encrypt and send to API.
   */
  private async processEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case "CREATE": {
        const { ciphertext, encryptedNoteKey } = await this.encryptPayload(
          event.payload,
        );
        
        await apiClient.post(
          WORKSPACE_API_ROUTES.NOTES,
          {
            id: event.entityId,
            ciphertext,
            encryptedNoteKey,
          },
          { auth: true },
        );
        break;
      }

      case "UPDATE": {
        const { ciphertext, encryptedNoteKey } = await this.encryptPayload(
          event.payload,
        );
        await apiClient.patch(
          `${WORKSPACE_API_ROUTES.NOTES}/${event.entityId}`,
          {
            ciphertext,
            encryptedNoteKey,
          },
          { auth: true },
        );
        break;
      }

      case "DELETE": {
        await apiClient.delete(
          `${WORKSPACE_API_ROUTES.NOTES}/${event.entityId}`,
          { auth: true },
        );
        break;
      }
    }
  }

  /**
   * Encrypt a note payload for the API.
   *
   * 1. Serialize the payload (title, emoji, coverImage, content) to JSON
   * 2. Generate a random AES note key
   * 3. Encrypt the JSON with the doc key → ciphertext
   * 4. Encrypt the doc key with the user's public RSA key → encryptedNoteKey
   */
  private async encryptPayload(
    payload: unknown,
  ): Promise<{ ciphertext: string; encryptedNoteKey: string }> {
    const note = payload as Note;

    // Extract base64 noteKey and remove it from the object before serializing
    const { noteKey: noteKeyBase64, ...payloadToEncrypt } = note;

    const dataString = JSON.stringify(payloadToEncrypt);

    let noteKey: Uint8Array;
    if (typeof noteKeyBase64 === "string") {
      const buffer = cryptoService.decodeBase64(noteKeyBase64);
      noteKey = new Uint8Array(buffer);
    } else {
      // Generate a random note key (AES-256)
      noteKey = globalThis.crypto.getRandomValues(
        new Uint8Array(CRYPTO_CONFIG.MASTER_KEY_BYTES_LENGTH),
      );
    }

    // Import as AES-GCM key
    const aesKey = await globalThis.crypto.subtle.importKey(
      "raw",
      noteKey as BufferSource,
      { name: CRYPTO_CONFIG.ALGORITHMS.AES },
      false,
      ["encrypt"],
    );

    // Encrypt note content
    const iv = globalThis.crypto.getRandomValues(
      new Uint8Array(CRYPTO_CONFIG.IV_BYTES_LENGTH),
    );
    const encoder = new TextEncoder();
    const encrypted = await globalThis.crypto.subtle.encrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.AES, iv },
      aesKey,
      encoder.encode(dataString),
    );

    const ciphertext = `${cryptoService.encodeBase64(iv.buffer)}:${cryptoService.encodeBase64(encrypted)}`;

    // Get user's public key from storage and encrypt the doc key with RSA
    const publicKeyJwk = await storageService.get<string>(
      STORAGE_KEYS.PUBLIC_KEY,
    );
    if (!publicKeyJwk) {
      throw new Error(
        "Public key not found in storage — cannot encrypt note key",
      );
    }

    const rsaPublicKey = await globalThis.crypto.subtle.importKey(
      "jwk",
      JSON.parse(publicKeyJwk) as JsonWebKey,
      {
        name: CRYPTO_CONFIG.ALGORITHMS.RSA,
        hash: CRYPTO_CONFIG.ALGORITHMS.HASH,
      },
      false,
      ["encrypt"],
    );

    const encryptedDocKeyBuffer = await globalThis.crypto.subtle.encrypt(
      { name: CRYPTO_CONFIG.ALGORITHMS.RSA },
      rsaPublicKey,
      noteKey as BufferSource,
    );

    const encryptedNoteKey = cryptoService.encodeBase64(encryptedDocKeyBuffer);

    return { ciphertext, encryptedNoteKey };
  }
}

export const syncQueueService = new SyncQueueService();
