import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { noteService } from "../services/note.service";
import { ROUTES } from "@/constants/routes.constants";

export function useDuplicateNote() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ noteId }: { noteId: string }) =>
      noteService.duplicateNote(noteId),
    onSuccess: (note) => {
      navigate(ROUTES.NOTE(note.id));
    },
  });
}
