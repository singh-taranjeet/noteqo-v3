import { useMutation } from "@tanstack/react-query";
import { noteService } from "../services/note.service";

export function useRestoreNote() {
  return useMutation({
    mutationFn: async (noteId: string) => {
      await noteService.restoreNote(noteId);
    },
  });
}
