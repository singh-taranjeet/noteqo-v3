"use client";
import { db } from "@/features/storage";
import type { Note, RemoteNote } from "../types/workspace.types";
import {
  NOTE_DEFAULTS,
  NOTE_EMOJI_POOL,
  NOTE_COVER_POOL,
  noteQueryKeys,
} from "../constants/workspace.constants";
import { noteSyncQueueService } from "./note-sync-queue.service";
import { noteApiService } from "./note-api.service";
import { logService } from "@/services/log.service";
import { spaceService } from "@/features/spaces";
import { NOTE_FALLBACKS } from "@/features/spaces";
import { cryptoService } from "@/features/crypto";
import { getQueryClient } from "@/components/Providers/Providers";
import { NoteLocalService } from "./note-local.service";

function getRandomItem<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

const queryClient = getQueryClient();

export const noteService = {
  /**
   * Creates a new note locally in Dexie and enqueues a CREATE sync event.
   * Returns the note immediately — no network call.
   */
  async createNote(
    spaceId: string,
    title?: string,
    parentId?: string,
  ): Promise<Note> {
    const now = new Date().toISOString();

    // Determine note type from the cached space
    const space = await db.spaces.get(spaceId);
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
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };

    await NoteLocalService.createNote(note);

    await noteSyncQueueService.enqueue({
      type: "CREATE",
      entityId: note.id,
      payload: note,
      entity: "note",
    });

    return note;
  },

  /**
   * Get all notes from local db
   * @returns
   */
  async getAllLocalNotes(): Promise<Note[]> {
    return NoteLocalService.getAllNotes();
  },
  /**
   * Returns all notes for a given space from local Dexie DB.
   */
  async getLocalNotesForSpace(spaceId: string): Promise<Note[]> {
    return NoteLocalService.getNoteOfSpace(spaceId);
  },

  /**
   * Returns a single note by ID from the local Dexie DB.
   */
  async getLocalNote(id: string): Promise<Note | undefined> {
    return NoteLocalService.getNote(id);
  },

  /**
   * Fetches a single note from remote.
   */
  async getRemoteNote(id: string): Promise<Note | undefined> {
    return noteApiService.getNote(id);
  },

  /**
   * Updates a note locally and enqueues an UPDATE sync event.
   */
  async updateNote(
    id: string,
    updates: Partial<Omit<Note, "id" | "createdAt">>,
  ): Promise<void> {
    const note = await this.getLocalNote(id);
    const patched = {
      ...note,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await NoteLocalService.updateNote(id, patched);

    const updatedNote = await this.getLocalNote(id);
    if (updatedNote) {
      await noteSyncQueueService.enqueue({
        type: "UPDATE",
        entityId: id,
        payload: patched,
        entity: "note",
      });
    }
  },

  /**
   * Duplicates an existing note locally with a new UUID and enqueues a CREATE sync event.
   * Appends " (Copy)" to the title of the duplicated note.
   */
  async duplicateNote(noteId: string): Promise<Note> {
    const existingNote = await NoteLocalService.getNote(noteId);
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

    await NoteLocalService.createNote(duplicate);

    await noteSyncQueueService.enqueue({
      type: "CREATE",
      entityId: duplicate.id,
      payload: duplicate,
      entity: "note",
    });

    return duplicate;
  },

  async getDescendantIdsLocally(id: string): Promise<string[]> {
    const allNotes = await NoteLocalService.getAllNotes();
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
      await NoteLocalService.updateNote(descendantId, {
        deletedAt: now,
      });
    }

    // Only enqueue DELETE for the parent; backend will cascade

    await noteSyncQueueService.enqueue({
      type: "DELETE",
      entityId: id,
      payload: { id },
      entity: "note",
    });
  },

  /**
   * Restores a soft-deleted note and its descendants locally and enqueues a RESTORE sync event.
   */
  async restoreNote(id: string): Promise<void> {
    const descendantIds = await this.getDescendantIdsLocally(id);

    for (const descendantId of descendantIds) {
      // Use Dexie's modify to unset deletedAt if it exists
      const note = await NoteLocalService.getNote(descendantId);

      if (note) {
        delete note.deletedAt;
        await NoteLocalService.updateNote(note.id, note);
      }
    }

    // Only enqueue RESTORE for the parent; backend will cascade

    await noteSyncQueueService.enqueue({
      type: "RESTORE",
      entityId: id,
      payload: { id },
      entity: "note",
    });
  },

  /**
   * Permanently deletes a note and its descendants locally and enqueues a PERMANENT_DELETE sync event.
   */
  async permanentDeleteNote(id: string): Promise<void> {
    const descendantIds = await this.getDescendantIdsLocally(id);

    for (const descendantId of descendantIds) {
      await NoteLocalService.deleteNote(descendantId);
    }

    await noteSyncQueueService.enqueue({
      type: "PERMANENT_DELETE",
      entityId: id,
      payload: { id },
      entity: "note",
    });
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
