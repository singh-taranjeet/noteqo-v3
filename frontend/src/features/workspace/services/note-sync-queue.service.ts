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
import { logService } from "@/services/log.service";
import { SYNC_EVENTS } from "@/features/shared/constants/sync-events.constants";
import { NoteLocalService } from "./note-local.service";

/** HTTP status code for version conflict */
const HTTP_CONFLICT = 409;

class NoteSyncQueueService extends BaseSyncQueueService {
  protected readonly entityType: SyncEntity = SYNC_ENTITY.NOTE;

  async processEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case SYNC_EVENT_TYPE.CREATE: {
        const fallbackNote = event.payload as Note;
        // Dynamically fetch absolute latest state
        const localNote =
          (await NoteLocalService.get(event.entityId)) || fallbackNote;
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
        await NoteLocalService.update(event.entityId, {
          remoteVersion: remoteNote.version,
          updatedAt: remoteNote.updatedAt,
        });
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
      `Conflict detected on note ${noteId} (local v${localNote.remoteVersion}). Creating conflict copy.`,
    );

    // 1. Save the user's local changes as a conflict copy
    const conflictCopy = await NoteLocalService.createConflictCopy(localNote);

    // Enqueue the conflict copy for creation on the server
    await this.enqueue({
      type: SYNC_EVENT_TYPE.CREATE,
      entityId: conflictCopy.id,
      payload: conflictCopy,
      entity: SYNC_ENTITY.NOTE,
    });

    // 2. Pull the server's latest version into the original note
    // This uses the unified handleInboundNote which handles Dexie writes safely
    await noteApiService.handleInboundNote({ noteId, version: Infinity });

    // 3. Notify the UI
    globalThis.dispatchEvent(
      new CustomEvent(SYNC_EVENTS.CONFLICT_DETECTED, {
        detail: { noteId, conflictCopyId: conflictCopy.id },
      }),
    );
  }

  async syncDirtyNotes(): Promise<void> {
    if (!navigator.onLine) return; // Skip when offline — isDirty persists in Dexie

    // getDirtyNotes already excludes shared notes (CRDT-synced via WebSocket)
    const dirtyNotes = await NoteLocalService.getDirtyNotes();

    for (const note of dirtyNotes) {
      if (note.deletedAt) continue;

      const ciphertext = await this.encryptPayload(note);

      try {
        const remoteNote = await noteApiService.updateNote({
          id: note.id,
          ciphertext,
          baseVersion: note.remoteVersion,
          updatedAt: note.updatedAt,
          isFavorite: note.isFavorite,
          parentId: note.parentId,
        });

        // Success — update sync metadata
        const updates: Partial<Note> = {
          remoteVersion: remoteNote.version,
        };

        // Only clear dirty flag if note wasn't modified during sync
        const currentNote = await NoteLocalService.get(note.id);
        if (currentNote && currentNote.updatedAt === note.updatedAt) {
          updates.isDirty = 0;
        }

        await NoteLocalService.update(note.id, updates);
      } catch (err) {
        if (err instanceof ApiError && err.status === HTTP_CONFLICT) {
          await this.handleConflict(note.id, note);
        }
        // On other errors: isDirty stays true, will retry next cycle
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

export const noteSyncQueueService = new NoteSyncQueueService();
