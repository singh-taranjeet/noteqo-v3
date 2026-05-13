import { useMutation } from "@tanstack/react-query";
import { noteService } from "@/features/workspace/services/note.service";

export function useDeleteNote() {
  return useMutation({
    mutationFn: async (noteId: string) => {
      await noteService.deleteNote(noteId);
    },
  });
}
