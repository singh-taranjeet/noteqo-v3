import { useQuery } from "@tanstack/react-query";
import { noteApiService } from "../services/note-api.service";
import { cryptoService } from "@/features/crypto";
import type { Note } from "../types/workspace.types";
import { logService } from "@/services/log.service";

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
              logService.warn(
                `No keySlot found for note! Note ID: ${note.id}`,
              );
              return null;
            }

            if (!note.ciphertext || !note.ciphertext.includes(":")) {
              logService.warn(
                `Invalid ciphertext format for note! Note ID: ${note.id}`,
              );
              return null;
            }

            const decryptedResult = await cryptoService.decryptDocument(
              note.ciphertext,
              encryptedNoteKey,
            );

            if (!decryptedResult) {
              return null;
            }

            return {
              id: note.id,
              title: decryptedResult.payload.title || "Untitled",
              emoji: decryptedResult.payload.emoji || "📄",
              coverImage: decryptedResult.payload.coverImage,
              content: decryptedResult.payload.content,
              syncStatus: "synced",
              createdAt: note.createdAt,
              updatedAt: note.updatedAt,
              noteKey: decryptedResult.noteKeyBase64,
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
