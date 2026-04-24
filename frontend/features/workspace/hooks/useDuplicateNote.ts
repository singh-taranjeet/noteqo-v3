import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { noteService } from "../services/note.service";
import { NOTES_QUERY_KEY } from "./useLocalNotes";
import { ROUTES } from "@/constants/routes";

export function useDuplicateNote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ noteId }: { noteId: string }) =>
      noteService.duplicateNote(noteId),
    onSuccess: (note) => {
      void queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      router.push(ROUTES.NOTE(note.id));
    },
  });
}
