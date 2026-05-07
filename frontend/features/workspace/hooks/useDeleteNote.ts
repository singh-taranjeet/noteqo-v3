import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { RECENT_NOTES_QUERY_KEY } from "./useRecentNotes";
import { SPACES_QUERY_KEY } from "@/features/spaces";

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      await noteService.deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SPACES_QUERY_KEY.LOCAL_SPACES_NOTES],
      });
      queryClient.invalidateQueries({ queryKey: RECENT_NOTES_QUERY_KEY });
    },
  });
}
