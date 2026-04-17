import { useQuery } from "@tanstack/react-query";
import { noteApiService } from "../services/note-api.service";
import { cryptoService } from "@/features/crypto";
import type { Document } from "../types/workspace.types";

export const REMOTE_DOCUMENTS_QUERY_KEY = ["remote-documents"] as const;

export function useRemoteDocuments() {
  return useQuery({
    queryKey: REMOTE_DOCUMENTS_QUERY_KEY,
    queryFn: async (): Promise<Document[]> => {
      // 1. Fetch remote notes
      const response = await noteApiService.getAllNotes();
      // Handle the case where response might be wrapped or unwrapped depending on the api client
      const remoteNotes = Array.isArray(response) ? response : (response as any).data || [];

      // 2. Decrypt in parallel
      const decryptedDocs = await Promise.all(
        remoteNotes.map(async (note: any) => {
          try {
            const encryptedDocKey = note.keySlots?.[0]?.encryptedDocKey;
            
            if (!encryptedDocKey) {
               console.warn(`No keySlot found for note! Note ID: ${note.id}`);
               throw new Error("Missing keySlot");
            }

            const decryptedPayload = await cryptoService.decryptDocument(
              note.ciphertext,
              encryptedDocKey
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
            } as Document;
          } catch (e) {
             console.error("Failed to decrypt document", note.id, e);
             return null;
          }
        })
      );

      // Filter out failures
      return decryptedDocs.filter((d): d is Document => d !== null).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },
  });
}
