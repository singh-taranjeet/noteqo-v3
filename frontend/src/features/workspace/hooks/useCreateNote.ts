import { useMutation } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

export function useCreateNote() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      spaceId,
      title,
      parentId,
    }: {
      spaceId: string;
      title?: string;
      parentId?: string;
    }) => noteService.createNote(spaceId, title, parentId),
    onSuccess: (note) => {
      navigate(ROUTES.NOTE(note.id));
    },
  });
}
