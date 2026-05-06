import { useMutation } from "@tanstack/react-query";
import { noteService } from "../services/note.service";

export function usePermanentDeleteNote() {
  return useMutation({
    mutationFn: async (noteId: string) => {
      await noteService.permanentDeleteNote(noteId);
    },
  });
}
