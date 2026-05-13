import type {
  SyncEvent,
  SyncEntity,
} from "@/features/shared/types/index.shared";
import { BaseSyncQueueService } from "@/features/shared/services/baseSync.shared.service";
import { db } from "@/features/storage";
import type { PendingMediaEntry } from "@/features/storage/services/db.service";
import { upload } from "@vercel/blob/client";
import { storageService, STORAGE_KEYS } from "@/features/storage";
import { API_BASE_URL } from "@/constants/config";
import { apiClient } from "@/services/api";
import { logService } from "@/services/log.service";

interface MediaCreatePayload {
  id: string;
  noteId: string;
  spaceId: string;
  mimeType: string;
  sizeBytes: number;
}

interface MediaDeletePayload {
  id: string;
  url?: string;
}

class MediaSyncQueueService extends BaseSyncQueueService {
  protected readonly entityType: SyncEntity = "media";

  async processEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case "CREATE": {
        const payload = event.payload as MediaCreatePayload;

        // Retrieve the pending encrypted blob from Dexie
        const pending = await db.pendingMediaBlobs.get(payload.id);
        if (!pending) {
          logService.warn(
            `Pending media blob not found for ID ${payload.id}, skipping`,
          );
          return;
        }

        await this.uploadPendingMedia(pending);
        break;
      }

      case "DELETE": {
        const payload = event.payload as MediaDeletePayload;
        await apiClient.delete(`/media/${payload.id}`, { auth: true });

        // Clean up local blob cache if URL is known
        if (payload.url) {
          try {
            await db.mediaBlobs.delete(payload.url);
          } catch {
            // Non-fatal
          }
        }
        break;
      }
    }
  }

  /**
   * Upload a pending encrypted media blob to Vercel Blob,
   * then cache the original (decrypted) file locally and register with backend.
   */
  private async uploadPendingMedia(pending: PendingMediaEntry): Promise<void> {
    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);

    // Upload encrypted blob to Vercel Blob
    const encryptedFile = new File([pending.encryptedBlob], pending.id, {
      type: pending.mimeType,
    });

    const blob = await upload(pending.id, encryptedFile, {
      access: "public",
      multipart: true,
      handleUploadUrl: `${API_BASE_URL}/media/upload`,
      clientPayload: JSON.stringify({
        token,
        id: pending.id,
        noteId: pending.noteId,
        spaceId: pending.spaceId,
        mimeType: pending.mimeType,
        sizeBytes: pending.sizeBytes.toString(),
      }),
    });

    // Write-through cache: store the original decrypted file in IndexedDB
    try {
      await db.mediaBlobs.put({
        url: blob.url,
        blob: pending.originalBlob,
        mimeType: pending.mimeType,
        sizeBytes: pending.sizeBytes,
        accessedAt: Date.now(),
      });
    } catch (cacheErr) {
      logService.warn("Failed to cache uploaded media blob locally", cacheErr);
    }

    // Register the media record with the backend
    const mediaRecord = {
      id: pending.id,
      noteId: pending.noteId,
      spaceId: pending.spaceId,
      mimeType: pending.mimeType,
      sizeBytes: pending.sizeBytes,
      url: blob.url,
      meta: null,
      createdAt: pending.createdAt,
    };

    try {
      await apiClient.post("/media/register", mediaRecord, { auth: true });
    } catch (err) {
      logService.warn("Failed to register media record with backend", err);
    }

    // Clean up the pending blob from Dexie
    await db.pendingMediaBlobs.delete(pending.id);
  }
}

export const mediaSyncQueueService = new MediaSyncQueueService();
