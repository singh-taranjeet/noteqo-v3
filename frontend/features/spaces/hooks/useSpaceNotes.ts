import { useState, useCallback, useEffect } from "react";
import { spaceApiService } from "../services/space-api.service";
import { logService } from "@/services/log.service";
import type { Note } from "@/features/workspace/types/workspace.types";
import { noteService } from "@/features/workspace";

export function useSpaceNotes(spaceId: string | null) {
  const [data, setData] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!spaceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await spaceApiService.getNotes(spaceId);

      // // Get the space key — either from cache or decrypt from the response
      // let spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);

      // if (!spaceKeyBase64 && response.encryptedSpaceKey) {
      //   // Decrypt the space key from the response's key slot
      //   const spaceKeyBytes = await spaceService.rsaDecryptSpaceKey(
      //     response.encryptedSpaceKey,
      //   );
      //   spaceKeyBase64 = (
      //     await import("@/features/crypto")
      //   ).cryptoService.encodeBase64(spaceKeyBytes.buffer as ArrayBuffer);
      // }

      // if (!spaceKeyBase64) {
      //   throw new Error("No space key available to decrypt notes");
      // }

      // Decrypt all notes with the space key
      const decryptedNotes = await Promise.all(
        response.notes.map((rn) => noteService.decryptNote(rn)),
      );

      const validNotes = decryptedNotes
        .filter((n): n is Note => n !== null)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

      setData(validNotes);
    } catch (err) {
      logService.error(`Failed to fetch notes for space ${spaceId}`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  return { data, isLoading, error, refetch: fetchNotes };
}
