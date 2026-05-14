import { db } from "@/features/storage";
import type { Note } from "@/features/workspace/types/workspace.types";

export const NoteLocalService = {
  create: async (note: Note) => {
    await db.notes.put(note);
    return note;
  },
  all: async () => {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  },
  ofSpace: async (spaceId: string) => {
    return db.notes
      .where("spaceId")
      .equals(spaceId)
      .filter((n) => !n.deletedAt)
      .reverse()
      .sortBy("updatedAt");
  },
  get: async (id: string) => {
    return db.notes.get(id);
  },
  getDirtyNotes: async () => {
    return db.notes.where("isDirty").equals(1).toArray();
  },
  update: async (id: string, updates: Partial<Omit<Note, "id">>) => {
    await db.notes.update(id, { ...updates });
  },
  delete: async (id: string) => {
    return db.notes.delete(id);
  },
  bulkUpdate: async (notes: Note[]) => {
    return db.notes.bulkPut(notes);
  },
  clear: async () => {
    return db.notes.clear();
  },
  createConflictCopy: async (note: Note) => {
    const now = new Date().toISOString();
    const conflictCopy: Note = {
      ...note,
      id: crypto.randomUUID(),
      title: `[V.${note.remoteVersion}] ${note.title} (Conflict Copy  – ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()})`,
      remoteVersion: 0,
      isDirty: 0,
      createdAt: now,
      updatedAt: now,
    };
    return NoteLocalService.create(conflictCopy);
  },
};
