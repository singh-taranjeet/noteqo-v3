import { db } from "@/features/storage";
import type { Note, RemoteNote } from "../types/workspace.types";
import {
  NOTE_DEFAULTS,
  NOTE_EMOJI_POOL,
  NOTE_COVER_POOL,
} from "@/features/workspace/constants/workspace.constants";
import { noteSyncQueueService } from "./note-sync-queue.service";
import { logService } from "@/services/log.service";
import { spaceService } from "@/features/spaces";
import { NOTE_FALLBACKS } from "@/features/spaces";
import { cryptoService } from "@/features/crypto";
import {
  SYNC_EVENT_TYPE,
  SYNC_ENTITY,
} from "@/features/shared/types/index.shared";
import { NoteLocalService } from "@/features/workspace/services/note-local.service";
import { SpaceLocalService } from "@/features/spaces/services/space-local.service";

function getRandomItem<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const noteService = {
  /**
   * Creates a new note locally in Dexie and enqueues a CREATE sync event.
   * Returns the note immediately — no network call.
   * useLiveQuery subscribers are notified automatically by the Dexie write.
   */
  async createNote(
    spaceId: string,
    title?: string,
    parentId?: string,
  ): Promise<Note> {
    const now = new Date().toISOString();

    const space = await SpaceLocalService.get(spaceId);
    const noteType = space?.type === "shared" ? "shared" : "private";

    const note: Note = {
      id: crypto.randomUUID(),
      title: title || NOTE_DEFAULTS.TITLE,
      emoji: getRandomItem(NOTE_EMOJI_POOL),
      coverImage: getRandomItem(NOTE_COVER_POOL),
      content: null,
      spaceId,
      parentId,
      type: noteType,
      version: 1,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };

    // Direct Dexie write — useLiveQuery picks this up automatically
    await NoteLocalService.create(note);

    await noteSyncQueueService.enqueue({
      type: SYNC_EVENT_TYPE.CREATE,
      entityId: note.id,
      payload: note,
      entity: SYNC_ENTITY.NOTE,
    });

    return note;
  },

  /**
   * Returns all notes from local Dexie DB, sorted by updatedAt desc.
   */
  async getAllLocalNotes(): Promise<Note[]> {
    return NoteLocalService.all();
  },

  /**
   * Returns all notes for a given space from local Dexie DB.
   */
  async getLocalNotesForSpace(spaceId: string): Promise<Note[]> {
    return NoteLocalService.ofSpace(spaceId);
  },

  /**
   * Returns a single note by ID from the local Dexie DB.
   */
  async getLocalNote(id: string): Promise<Note | undefined> {
    return NoteLocalService.get(id);
  },

  /**
   * Updates a note locally and enqueues an UPDATE sync event.
   * useLiveQuery subscribers are notified automatically by the Dexie write.
   */
  async updateNote(
    id: string,
    updates: Partial<Omit<Note, "id" | "createdAt">>,
  ): Promise<void> {
    const updatedAt = new Date().toISOString();

    // Direct Dexie write
    await NoteLocalService.update(id, { ...updates, updatedAt });

    // Read back the full note for the sync payload
    const updatedNote = await NoteLocalService.get(id);
    if (updatedNote) {
      await noteSyncQueueService.enqueue({
        type: SYNC_EVENT_TYPE.UPDATE,
        entityId: id,
        payload: updatedNote,
        entity: SYNC_ENTITY.NOTE,
      });
    }
  },

  /**
   * Duplicates an existing note locally with a new UUID and enqueues a CREATE sync event.
   * Appends " (Copy)" to the title of the duplicated note.
   */
  async duplicateNote(noteId: string): Promise<Note> {
    const existingNote = await NoteLocalService.get(noteId);
    if (!existingNote) {
      throw new Error(`Note not found: ${noteId}`);
    }

    const now = new Date().toISOString();
    const newTitle = `${existingNote.title} (Copy)`;

    const duplicate: Note = {
      ...existingNote,
      id: crypto.randomUUID(),
      title: newTitle,
      createdAt: now,
      updatedAt: now,
    };

    await NoteLocalService.create(duplicate);

    await noteSyncQueueService.enqueue({
      type: SYNC_EVENT_TYPE.CREATE,
      entityId: duplicate.id,
      payload: duplicate,
      entity: SYNC_ENTITY.NOTE,
    });

    return duplicate;
  },

  async getDescendantIdsLocally(id: string): Promise<string[]> {
    const allNotes = await NoteLocalService.all();
    const descendants: string[] = [id];

    const queue = [id];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = allNotes
        .filter((n) => n.parentId === currentId)
        .map((n) => n.id);
      descendants.push(...children);
      queue.push(...children);
    }

    return descendants;
  },

  /**
   * Marks a note and its descendants as deleted locally and enqueues a DELETE sync event for the parent.
   */
  async deleteNote(id: string): Promise<void> {
    const descendantIds = await this.getDescendantIdsLocally(id);
    const now = new Date().toISOString();

    for (const descendantId of descendantIds) {
      await NoteLocalService.update(descendantId, { deletedAt: now });
    }

    // Only enqueue DELETE for the parent; backend will cascade
    await noteSyncQueueService.enqueue({
      type: SYNC_EVENT_TYPE.DELETE,
      entityId: id,
      payload: { id },
      entity: SYNC_ENTITY.NOTE,
    });
  },

  /**
   * Restores a soft-deleted note and its descendants locally and enqueues a RESTORE sync event.
   */
  async restoreNote(id: string): Promise<void> {
    const descendantIds = await this.getDescendantIdsLocally(id);

    for (const descendantId of descendantIds) {
      const note = await NoteLocalService.get(descendantId);
      if (note) {
        delete note.deletedAt;
        await NoteLocalService.create(note);
      }
    }

    // Only enqueue RESTORE for the parent; backend will cascade
    await noteSyncQueueService.enqueue({
      type: SYNC_EVENT_TYPE.RESTORE,
      entityId: id,
      payload: { id },
      entity: SYNC_ENTITY.NOTE,
    });
  },

  /**
   * Permanently deletes a note and its descendants locally and enqueues a PERMANENT_DELETE sync event.
   */
  async permanentDeleteNote(id: string): Promise<void> {
    const descendantIds = await this.getDescendantIdsLocally(id);

    for (const descendantId of descendantIds) {
      await NoteLocalService.delete(descendantId);
    }

    await noteSyncQueueService.enqueue({
      type: SYNC_EVENT_TYPE.PERMANENT_DELETE,
      entityId: id,
      payload: { id },
      entity: SYNC_ENTITY.NOTE,
    });
  },

  /**
   * Bulk puts notes into local Dexie DB.
   * Used by remote sync to merge decrypted notes.
   */
  async bulkPutNotes(notes: Note[]): Promise<void> {
    await NoteLocalService.bulkUpdate(notes);
  },

  /**
   * Decrypts a remote note using the space key.
   */
  async decryptNote(note: RemoteNote): Promise<Note | null> {
    try {
      if (!note.ciphertext?.includes(":")) {
        logService.warn(
          `Invalid ciphertext format for note! Note ID: ${note.id}`,
        );
        return null;
      }

      const spaceKeyBytes = await spaceService.getSpaceKeyBytes(note.spaceId);
      const jsonStr = await cryptoService.decryptString(
        note.ciphertext,
        spaceKeyBytes,
      );

      const payload = JSON.parse(jsonStr) as {
        title?: string;
        emoji?: string;
        coverImage?: string;
        content?: unknown;
        parentId?: string;
      };

      return {
        id: note.id,
        title: payload.title ?? NOTE_FALLBACKS.TITLE,
        emoji: payload.emoji ?? NOTE_FALLBACKS.EMOJI,
        coverImage: payload.coverImage ?? NOTE_FALLBACKS.COVER_IMAGE,
        content: payload.content ?? null,
        parentId: note.parentId ?? payload.parentId ?? undefined,
        spaceId: note.spaceId,
        type: note.type as "private" | "shared",
        version: note.version,
        isFavorite: note.isFavorite ?? false,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        deletedAt: note.deletedAt ?? undefined,
      };
    } catch (e) {
      logService.error("Failed to decrypt note " + JSON.stringify(e));
      return null;
    }
  },
};
