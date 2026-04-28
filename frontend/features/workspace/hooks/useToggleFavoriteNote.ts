"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { NOTES_QUERY_KEY } from "./useLocalNotes";
import { RECENT_NOTES_QUERY_KEY } from "./useRecentNotes";

export function useToggleFavoriteNote() {
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: RECENT_NOTES_QUERY_KEY });
    },
  });
}
