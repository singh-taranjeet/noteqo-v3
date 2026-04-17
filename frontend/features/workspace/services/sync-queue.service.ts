import { db, storageService, STORAGE_KEYS } from '@/features/storage';
import { cryptoService } from '@/features/crypto/services/crypto.service';
import { apiClient } from '@/services/api';
import type { SyncEvent, SyncEventType } from '../types/workspace.types';
import { SYNC_CONFIG, WORKSPACE_API_ROUTES } from '../constants/workspace.constants';

/**
 * Background sync queue that processes document events (CREATE, UPDATE, DELETE).
 *
 * - Coalesces events: if a pending event for the same entity exists, it merges
 *   instead of creating duplicates.
 * - Encrypts document content via cryptoService before sending to the API.
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
    window.addEventListener('online', this.onlineHandler);
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
      window.removeEventListener('online', this.onlineHandler);
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
  async enqueue(type: SyncEventType, entityId: string, payload: unknown): Promise<void> {
    const existing = await db.syncQueue
      .where('entityId')
      .equals(entityId)
      .first();

    if (existing) {
      if (existing.type === 'CREATE' && type === 'UPDATE') {
        // Merge into the existing CREATE — will still POST on sync
        await db.syncQueue.update(existing.id, { payload });
        return;
      }

      if (existing.type === 'CREATE' && type === 'DELETE') {
        // Net zero — never hit the API
        await db.syncQueue.delete(existing.id);
        return;
      }

      if (existing.type === 'UPDATE' && type === 'UPDATE') {
        // Update payload of existing UPDATE event
        await db.syncQueue.update(existing.id, { payload });
        return;
      }

      if (existing.type === 'UPDATE' && type === 'DELETE') {
        // Replace UPDATE with DELETE
        await db.syncQueue.update(existing.id, { type: 'DELETE', payload });
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
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    this.isProcessing = true;

    try {
      const events = await db.syncQueue.orderBy('createdAt').toArray();

      for (const event of events) {
        try {
          await this.processEvent(event);
          // Success — delete from queue
          await db.syncQueue.delete(event.id);
          // Update document syncStatus
          await db.documents.update(event.entityId, { syncStatus: 'synced' });
        } catch (error) {
          const newRetryCount = event.retryCount + 1;

          if (newRetryCount >= SYNC_CONFIG.MAX_RETRY_COUNT) {
            // Max retries exceeded — delete event, mark document as failed
            await db.syncQueue.delete(event.id);
            await db.documents.update(event.entityId, { syncStatus: 'failed' });
          } else {
            await db.syncQueue.update(event.id, { retryCount: newRetryCount });
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
      case 'CREATE': {
        const { ciphertext, encryptedDocKey } = await this.encryptPayload(event.payload);
        await apiClient.post(WORKSPACE_API_ROUTES.NOTES, {
          id: event.entityId,
          ciphertext,
          encryptedDocKey,
        });
        break;
      }

      case 'UPDATE': {
        const { ciphertext, encryptedDocKey } = await this.encryptPayload(event.payload);
        await apiClient.patch(`${WORKSPACE_API_ROUTES.NOTES}/${event.entityId}`, {
          ciphertext,
          encryptedDocKey,
        });
        break;
      }

      case 'DELETE': {
        await apiClient.delete(`${WORKSPACE_API_ROUTES.NOTES}/${event.entityId}`);
        break;
      }
    }
  }

  /**
   * Encrypt a document payload for the API.
   *
   * 1. Serialize the payload (title, emoji, coverImage, content) to JSON
   * 2. Generate a random AES document key
   * 3. Encrypt the JSON with the doc key → ciphertext
   * 4. Encrypt the doc key with the user's public RSA key → encryptedDocKey
   */
  private async encryptPayload(payload: unknown): Promise<{ ciphertext: string; encryptedDocKey: string }> {
    const dataString = JSON.stringify(payload);

    // Generate a random document key (AES-256)
    const docKey = window.crypto.getRandomValues(new Uint8Array(32));

    // Import as AES-GCM key
    const aesKey = await window.crypto.subtle.importKey(
      'raw',
      docKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt'],
    );

    // Encrypt document content
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      encoder.encode(dataString),
    );

    const ciphertext = `${this.bufferToBase64(iv.buffer)}:${this.bufferToBase64(encrypted)}`;

    // Get user's public key from storage and encrypt the doc key with RSA
    const publicKeyJwk = await storageService.get<string>(STORAGE_KEYS.PUBLIC_KEY);
    if (!publicKeyJwk) {
      throw new Error('Public key not found in storage — cannot encrypt document key');
    }

    const rsaPublicKey = await window.crypto.subtle.importKey(
      'jwk',
      JSON.parse(publicKeyJwk) as JsonWebKey,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    );

    const encryptedDocKeyBuffer = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      rsaPublicKey,
      docKey,
    );

    const encryptedDocKey = this.bufferToBase64(encryptedDocKeyBuffer);

    return { ciphertext, encryptedDocKey };
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

export const syncQueueService = new SyncQueueService();
