import { useMutation } from "@tanstack/react-query";
import { noteService } from "../services/note.service";

export function useToggleFavoriteNote() {
  return useMutation({
    mutationFn: async ({
      noteId,
      isFavorite,
    }: {
      noteId: string;
      isFavorite: boolean;
    }) => {
      await noteService.updateNote(noteId, { isFavorite });
    },
  });
}
