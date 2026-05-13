
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/features/storage";
import type { Note } from "../types/workspace.types";

/**
 * Live query for all local notes, sorted by updatedAt desc.
 * Auto-re-renders on any Dexie write to the notes table.
 */
export function useLocalNotes(): {
  data: Note[] | undefined;
  isLoading: boolean;
} {
  const data = useLiveQuery(
    () => db.notes.orderBy("updatedAt").reverse().toArray(),
    [],
  );

  return {
    data,
    isLoading: data === undefined,
  };
}
