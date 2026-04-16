import { db } from "@/features/storage";
import type { Note, RemoteNote } from "../types/workspace.types";
import {
  NOTE_DEFAULTS,
  NOTE_EMOJI_POOL,
  NOTE_COVER_POOL,
} from "../constants/workspace.constants";
import { syncQueueService } from "./sync-queue.service";
import { noteApiService } from "./note-api.service";
import { logService } from "@/services/log.service";
import { spaceService } from "@/features/spaces";
import { NOTE_FALLBACKS } from "@/features/spaces";
import { cryptoService } from "@/features/crypto";

function getRandomItem<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const noteService = {
  /**
   * Creates a new note locally in Dexie and enqueues a CREATE sync event.
   * Returns the note immediately — no network call.
   */
  async createNote(spaceId: string, title?: string): Promise<Note> {
    const now = new Date().toISOString();

    // Determine note type from the cached space
    const space = await db.spaces.get(spaceId);
    const noteType = space?.type === "shared" ? "shared" : "private";

    const note: Note = {
      id: crypto.randomUUID(),
      title: title ?? NOTE_DEFAULTS.TITLE,
      emoji: getRandomItem(NOTE_EMOJI_POOL),
      coverImage: getRandomItem(NOTE_COVER_POOL),
      content: null,
      syncStatus: "pending",
      spaceId,
      type: noteType,
      createdAt: now,
      updatedAt: now,
    };

    await db.notes.put(note);
    await syncQueueService.enqueue("CREATE", note.id, note);

    return note;
  },

  /**
   * Get all notes from local db
   * @returns
   */
  async getAllLocalNotes(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  },

  /**
   * Returns all notes for a given space from local Dexie DB.
   */
  async getLocalNotesForSpace(spaceId: string): Promise<Note[]> {
    return db.notes
      .where("spaceId")
      .equals(spaceId)
      .reverse()
      .sortBy("updatedAt");
  },

  /**
   * Returns a single note by ID from the local Dexie DB.
   */
  async getLocalNote(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
  },

  /**
   * Fetches a single note from remote, decrypts with space key, and caches locally.
   */
  async getRemoteNote(id: string): Promise<Note | undefined> {
    const remoteNote = await noteApiService.getNote(id);
    if (remoteNote) {
      const decryptedNote = await noteService.decryptNote(remoteNote);
      if (decryptedNote) {
        logService.log("Decrypted Note", decryptedNote, remoteNote);
        await db.notes.put(decryptedNote);
      }
      return decryptedNote ?? undefined;
    }
  },

  /**
   * Updates a note locally and enqueues an UPDATE sync event.
   */
  async updateNote(
    id: string,
    updates: Partial<Omit<Note, "id" | "createdAt">>,
  ): Promise<void> {
    const patched = {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: "pending" as const,
    };
    await db.notes.update(id, patched);

    const note = await db.notes.get(id);
    if (note) {
      await syncQueueService.enqueue("UPDATE", id, note);
    }
  },

  /**
   * Marks a note as deleted locally and enqueues a DELETE sync event.
   */
  async deleteNote(id: string): Promise<void> {
    await db.notes.delete(id);
    await syncQueueService.enqueue("DELETE", id, { id });
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
      };

      return {
        id: note.id,
        title: payload.title ?? NOTE_FALLBACKS.TITLE,
        emoji: payload.emoji ?? NOTE_FALLBACKS.EMOJI,
        coverImage: payload.coverImage ?? NOTE_FALLBACKS.COVER_IMAGE,
        content: payload.content ?? null,
        syncStatus: "pending",
        spaceId: note.spaceId,
        type: note.type as "private" | "shared",
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
    } catch (e) {
      logService.error("Failed to decrypt note " + JSON.stringify(e));
      return null;
    }
  },
};
