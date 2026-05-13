import { cryptoService } from "@/features/crypto";
import type { Note } from "../types/workspace.types";
import { noteApiService } from "./note-api.service";
import { spaceService } from "@/features/spaces/services/space.service";
import {
  SYNC_EVENT_TYPE,
  SYNC_ENTITY,
  type SyncEvent,
  type SyncEntity,
} from "@/features/shared/types/index.shared";
import { BaseSyncQueueService } from "@/features/shared/services/baseSync.shared.service";
import { ApiError } from "@/services/api";
import { db } from "@/features/storage";
import { logService } from "@/services/log.service";

/** HTTP status code for version conflict */
const HTTP_CONFLICT = 409;

class NoteSyncQueueService extends BaseSyncQueueService {
  protected readonly entityType: SyncEntity = SYNC_ENTITY.NOTE;

  async processEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case SYNC_EVENT_TYPE.CREATE: {
        const fallbackNote = event.payload as Note;
        // Dynamically fetch absolute latest state
        const localNote = (await db.notes.get(event.entityId)) || fallbackNote;
        const ciphertext = await this.encryptPayload(localNote);

        const remoteNote = await noteApiService.createNote({
          id: event.entityId,
          ciphertext,
          spaceId: localNote.spaceId,
          type: localNote.type,
          isFavorite: localNote.isFavorite,
          parentId: localNote.parentId,
          createdAt: localNote.createdAt,
          updatedAt: this.getUpdatedAt(),
        });

        // Update local Dexie note with definitive server version
        await db.notes.update(event.entityId, {
          version: remoteNote.version,
          updatedAt: remoteNote.updatedAt,
        });
        break;
      }

      case SYNC_EVENT_TYPE.UPDATE: {
        const fallbackNote = event.payload as Note;
        const localNote = (await db.notes.get(event.entityId)) || fallbackNote;

        if (localNote.deletedAt) break; // Don't send updates for deleted notes

        const ciphertext = await this.encryptPayload(localNote);

        try {
          const remoteNote = await noteApiService.updateNote({
            id: event.entityId,
            ciphertext,
            baseVersion: localNote.version,
            isFavorite: localNote.isFavorite,
            parentId: localNote.parentId,
            updatedAt: this.getUpdatedAt(),
          });

          // Safely update local Dexie note with new definitive server version
          // This prevents self-conflicts for subsequent updates queued for this note
          await db.notes.update(event.entityId, {
            version: remoteNote.version,
            updatedAt: remoteNote.updatedAt,
          });
        } catch (err) {
          if (err instanceof ApiError && err.status === HTTP_CONFLICT) {
            await this.handleConflict(event.entityId, localNote);
            return; // Conflict handled — don't rethrow
          }
          throw err;
        }
        break;
      }

      case SYNC_EVENT_TYPE.DELETE: {
        await noteApiService.deleteNote(event.entityId);
        break;
      }

      case SYNC_EVENT_TYPE.RESTORE: {
        await noteApiService.restoreNote(event.entityId);
        break;
      }

      case SYNC_EVENT_TYPE.PERMANENT_DELETE: {
        await noteApiService.permanentDeleteNote(event.entityId);
        break;
      }
    }
  }

  /**
   * Handles a 409 Conflict by:
   * 1. Creating a local "conflict copy" note with the user's offline changes
   * 2. Pulling the server's latest version into the original note
   * 3. Dispatching a UI event so a toast can notify the user
   */
  private async handleConflict(noteId: string, localNote: Note): Promise<void> {
    logService.warn(
      `Conflict detected on note ${noteId} (local v${localNote.version}). Creating conflict copy.`,
    );

    const now = new Date().toISOString();

    // 1. Save the user's local changes as a conflict copy
    const conflictCopy: Note = {
      ...localNote,
      id: crypto.randomUUID(),
      title: `${localNote.title} (Conflict Copy – ${new Date().toLocaleDateString()})`,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    await db.notes.put(conflictCopy);

    // Enqueue the conflict copy for creation on the server
    await this.enqueue({
      type: SYNC_EVENT_TYPE.CREATE,
      entityId: conflictCopy.id,
      payload: conflictCopy,
      entity: SYNC_ENTITY.NOTE,
    });

    // 2. Pull the server's latest version into the original note
    await noteApiService.getNote(noteId);

    // 3. Notify the UI
    globalThis.dispatchEvent(
      new CustomEvent("noteqo:conflict-detected", {
        detail: { noteId, conflictCopyId: conflictCopy.id },
      }),
    );
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

export const noteSyncQueueService = new NoteSyncQueueService();
