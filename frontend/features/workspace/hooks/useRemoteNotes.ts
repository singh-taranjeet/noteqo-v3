import { useQuery } from "@tanstack/react-query";
import { spaceApiService } from "@/features/spaces";
import type { Note } from "../types/workspace.types";
import type { Space } from "@/features/spaces";
import { logService } from "@/services/log.service";
import { db } from "@/features/storage";

import { noteService } from "../services/note.service";

export const REMOTE_NOTES_QUERY_KEY = "remote-notes";

export interface SpaceNotesMap {
  [spaceId: string]: Note[];
}

export function useRemoteNotes(spaces: Space[] | undefined) {
  const query = useQuery({
    queryKey: [REMOTE_NOTES_QUERY_KEY, spaces?.map((s) => s.id)],
    enabled: !!spaces && spaces.length > 0,
    queryFn: async () => {
      if (!spaces || spaces.length === 0) return {};

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

      return notesMap;
    },
  });

  return {
    data: query.data || {},
    isLoading: query.isLoading,
    error: query.error,
  };
}
