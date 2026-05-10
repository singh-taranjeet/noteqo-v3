"use client";
import { useQuery } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { QueryKeys } from "@/features/shared/constants/index.shared.constants";

export function useLocalNotes() {
  return useQuery({
    queryKey: QueryKeys.notes.local.all,
    queryFn: () => noteService.getAllLocalNotes(),
  });
}
