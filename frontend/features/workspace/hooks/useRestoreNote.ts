import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { SPACES_QUERY_KEY } from "@/features/spaces";
import { RECENT_NOTES_QUERY_KEY } from "./useRecentNotes";

export function useRestoreNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      await noteService.restoreNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LOCAL_SPACES_NOTES] });
      queryClient.invalidateQueries({ queryKey: RECENT_NOTES_QUERY_KEY });
    },
  });
}
