"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { NOTES_QUERY_KEY } from "./useLocalNotes";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function useCreateNote() {
  const queryClient = useQueryClient();
  const router = useRouter();

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
      void queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["spaces"] });
      router.push(ROUTES.NOTE(note.id));
    },
  });
}
