import { useState, useCallback, useEffect } from "react";
import { spaceApiService } from "@/features/spaces";
import type { Note } from "../types/workspace.types";
import type { Space } from "@/features/spaces";
import { logService } from "@/services/log.service";
import { db } from "@/features/storage";
import { mergeLocalRemoteService } from "../services/merge-local-remote.service";
import { noteService } from "../services/note.service";

export interface SpaceNotesMap {
  [spaceId: string]: Note[];
}

export function useRemoteNotes(spaces: Space[] | undefined) {
  const [data, setData] = useState<SpaceNotesMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!spaces || spaces.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const notesMap: SpaceNotesMap = {};

      for (const space of spaces) {
        try {
          const response = await spaceApiService.getNotes(space.id);

          // Decrypt all notes with the cached space key
          const decryptedNotes = await Promise.all(
            response.notes.map((rn) => noteService.decryptNote(rn)),
          );

          const validNotes = decryptedNotes
            .filter((n): n is Note => n !== null)
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            );

          notesMap[space.id] = validNotes;

          // Cache notes locally in Dexie
          await db.notes.bulkPut(validNotes);
        } catch (err) {
          logService.error(`Failed to fetch notes for space ${space.id}`, err);
          notesMap[space.id] = [];
        }
      }

      // // Merge with local notes
      // const allNotes = Object.values(notesMap).flat();
      // await mergeLocalRemoteService.merge(allNotes);

      setData(notesMap);
    } catch (err) {
      logService.error("Failed to fetch remote notes", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [spaces]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  return { data, isLoading, error };
}
