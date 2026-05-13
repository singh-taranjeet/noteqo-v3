"use client";
import { useMutation } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function useCreateNote() {
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
      router.push(ROUTES.NOTE(note.id));
    },
  });
}
