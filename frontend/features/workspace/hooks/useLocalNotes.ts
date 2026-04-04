import { useQuery } from "@tanstack/react-query";
import { noteService } from "../services/note.service";

export const NOTES_QUERY_KEY = ["local-notes"] as const;

export function useLocalNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: () => noteService.getAllNotes(),
  });
}
