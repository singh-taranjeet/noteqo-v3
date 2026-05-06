"use client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { noteService } from "../services/note.service";
import { ROUTES } from "@/constants/routes";

export function useDuplicateNote() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ noteId }: { noteId: string }) =>
      noteService.duplicateNote(noteId),
    onSuccess: (note) => {
      router.push(ROUTES.NOTE(note.id));
    },
  });
}
