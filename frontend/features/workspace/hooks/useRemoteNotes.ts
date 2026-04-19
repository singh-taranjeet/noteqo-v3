import { useQuery } from "@tanstack/react-query";
import { noteApiService } from "../services/note-api.service";
import { cryptoService } from "@/features/crypto";
import type { Note } from "../types/workspace.types";

export const REMOTE_NOTES_QUERY_KEY = ["remote-notes"] as const;

export function useRemoteNotes() {
  return useQuery({
    queryKey: REMOTE_NOTES_QUERY_KEY,
    queryFn: async (): Promise<Note[]> => {
      // 1. Fetch remote notes
      const response = await noteApiService.getAllNotes();
      console.log("response", response);
      const remoteNotes = Array.isArray(response.data) ? response.data : [];

      // 2. Decrypt in parallel
      const decryptedDocs = await Promise.all(
        remoteNotes.map(async (note: any) => {
          try {
            const encryptedNoteKey = note.keySlots?.[0]?.encryptedNoteKey;

            if (!encryptedNoteKey) {
              console.warn(`No keySlot found for note! Note ID: ${note.id}`);
              throw new Error("Missing keySlot");
            }

            const decryptedPayload = await cryptoService.decryptDocument(
              note.ciphertext,
              encryptedNoteKey,
            );

            return {
              id: note.id,
              title: decryptedPayload.title || "Untitled",
              emoji: decryptedPayload.emoji || "📄",
              coverImage: decryptedPayload.coverImage,
              content: decryptedPayload.content,
              syncStatus: "synced",
              createdAt: note.createdAt,
              updatedAt: note.updatedAt,
            } as Note;
          } catch (e) {
            console.error("Failed to decrypt note", note.id, e);
            return null;
          }
        }),
      );

      // Filter out failures
      return decryptedDocs
        .filter((d): d is Note => d !== null)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    },
  });
}
