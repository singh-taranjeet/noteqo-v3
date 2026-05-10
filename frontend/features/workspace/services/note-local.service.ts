"use client";
import { getQueryClient } from "@/components/Providers/Providers";
import { QueryKeys } from "@/features/shared/constants/index.shared.constants";
import { db } from "@/features/storage";
import type { Note } from "@/features/workspace/types/workspace.types";

export const NoteLocalService = {
  client: () => {
    const queryClient = getQueryClient();
    return queryClient;
  },
  invalidateLocalNote: async (id: string) => {
    await NoteLocalService.client().invalidateQueries({
      queryKey: QueryKeys.notes.local.get(id),
    });
  },
  invalidateGetNotes: async () => {
    await NoteLocalService.client().invalidateQueries({
      queryKey: [QueryKeys.notes.local.all, QueryKeys.notes.local.allOfSpace],
    });
  },
  updateNote: async (
    id: string,
    updates: Partial<Omit<Note, "id" | "createdAt">>,
  ) => {
    await db.notes.update(id, updates);
    await NoteLocalService.invalidateLocalNote(id);
    await NoteLocalService.invalidateGetNotes();
  },
  createNote: async (note: Note) => {
    await db.notes.put(note);
    await NoteLocalService.invalidateLocalNote(note.id);
    await NoteLocalService.invalidateGetNotes();
  },
  getAllNotes: async () => {
    return NoteLocalService.client().fetchQuery({
      queryKey: QueryKeys.notes.local.all,
      queryFn: async () => {
        return db.notes.orderBy("updatedAt").reverse().toArray();
      },
      staleTime: 10 * 60 * 1000,
    });
  },
  getNoteOfSpace: async (spaceId: string) => {
    return NoteLocalService.client().fetchQuery({
      queryKey: QueryKeys.notes.local.allOfSpace(spaceId),
      queryFn: async () => {
        return db.notes
          .where("spaceId")
          .equals(spaceId)
          .reverse()
          .sortBy("updatedAt");
      },
      staleTime: 10 * 60 * 1000,
    });
  },
  getNote: async (noteId: string) => {
    return NoteLocalService.client().fetchQuery({
      queryKey: QueryKeys.notes.local.get(noteId),
      queryFn: async () => {
        return db.notes.get(noteId);
      },
      staleTime: 10 * 60 * 1000,
    });
  },
  deleteNote: async (noteId: string) => {
    await db.notes.delete(noteId);
    await NoteLocalService.invalidateLocalNote(noteId);
    await NoteLocalService.invalidateGetNotes();
  },
  bulkPut: async (notes: Note[]) => {
    await db.notes.bulkPut(notes);
    await NoteLocalService.invalidateGetNotes();
  },
};
