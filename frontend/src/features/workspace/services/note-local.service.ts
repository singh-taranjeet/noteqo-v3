import { db } from "@/features/storage";
import type { Note } from "@/features/workspace/types/workspace.types";

export const NoteLocalService = {

    create: async (note: Note) => {
        await db.notes.put(note);
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
            .sortBy("updatedAt")
    },
    get: async (id: string) => {
        return db.notes.get(id)
    },
    update: async (id: string, updates: Partial<Omit<Note, "id">>) => {
        await db.notes.update(id, { ...updates });
    },
    delete: async (id: string) => {
        return db.notes.delete(id)
    },
    bulkUpdate: async (notes: Note[]) => {
        return db.notes.bulkPut(notes)
    },
    clear: async () => {
        return db.notes.clear();
    }

}