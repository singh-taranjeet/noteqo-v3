import { db } from "@/features/storage";
import { cryptoService } from "@/features/crypto";
import type { Note } from "../types/workspace.types";
import {
  NOTE_DEFAULTS,
  NOTE_EMOJI_POOL,
  NOTE_COVER_POOL,
} from "../constants/workspace.constants";
import { syncQueueService } from "./sync-queue.service";

function getRandomItem<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const noteService = {
  /**
   * Creates a new note locally in Dexie and enqueues a CREATE sync event.
   * Returns the note immediately — no network call.
   */
  async createNote(title?: string): Promise<Note> {
    const docKeyBase64 = cryptoService.generateDocumentKey();

    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title: title ?? NOTE_DEFAULTS.TITLE,
      emoji: getRandomItem(NOTE_EMOJI_POOL),
      coverImage: getRandomItem(NOTE_COVER_POOL),
      content: null,
      syncStatus: "pending",
      createdAt: now,
      updatedAt: now,
      noteKey: docKeyBase64,
    };

    await db.notes.put(note);
    await syncQueueService.enqueue("CREATE", note.id, note);

    return note;
  },

  /**
   * Returns all documents from the local Dexie DB.
   */
  async getAllNotes(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  },

  /**
   * Returns a single note by ID from the local Dexie DB.
   */
  async getNote(id: string): Promise<Note | undefined> {
    return db.notes.get(id);
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
};
