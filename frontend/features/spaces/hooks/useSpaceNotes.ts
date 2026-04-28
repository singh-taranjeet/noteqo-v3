import { useQuery } from "@tanstack/react-query";
import { spaceApiService } from "../services/space-api.service";
import { logService } from "@/services/log.service";
import type { Note } from "@/features/workspace/types/workspace.types";
import { noteService } from "@/features/workspace";

export const SPACE_NOTES_QUERY_KEY = "space-notes";

export function useSpaceNotes(spaceId: string | null) {
  const query = useQuery({
    queryKey: [SPACE_NOTES_QUERY_KEY, spaceId],
    enabled: !!spaceId,
    queryFn: async () => {
      if (!spaceId) return [];

      try {
        const response = await spaceApiService.getNotes(spaceId);

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

        return validNotes;
      } catch (err) {
        logService.error(`Failed to fetch notes for space ${spaceId}`, err);
        throw err;
      }
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
