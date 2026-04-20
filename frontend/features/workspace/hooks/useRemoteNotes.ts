import { useState, useCallback, useEffect } from "react";
import { noteApiService } from "../services/note-api.service";
import type { Note, RemoteNote } from "../types/workspace.types";
import { logService } from "@/services/log.service";
import { noteService } from "../services/note.service";
import { mergeLocalRemoteService } from "../services/merge-local-remote.service";

export function useRemoteNotes() {
  const [data, setData] = useState<Note[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Fetch remote notes via the explicit API service
      const response = await noteApiService.getAllNotes();
      const remoteNotes = Array.isArray(response.data) ? response.data : [];

      // 2. Decrypt securely in parallel using the dedicated service logic you created
      const decryptedDocs = await Promise.all(
        remoteNotes.map((remoteNote: RemoteNote) =>
          noteService.decryptNote(remoteNote),
        ),
      );

      // 3. Purge decryption failures and enforce sequential time sorting
      const safelyParsedNotes = decryptedDocs
        .filter((d): d is Note => d !== null)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

      // 4. Merge the remote notes with the local ones
      await mergeLocalRemoteService.merge(safelyParsedNotes);

      setData(safelyParsedNotes);
    } catch (err) {
      logService.error("Failed to execute native remote fetch wrapper", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger automatically on mount aligning with behavior previously supplied by React Query
  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  return { data, isLoading, error, refetch: fetchNotes };
}
