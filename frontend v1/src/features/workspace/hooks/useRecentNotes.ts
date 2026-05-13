import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/features/storage";
import type { Note } from "@/features/workspace/types/workspace.types";

export const RECENT_NOTES_QUERY_KEY = ["recent-notes"] as const;

function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

function sortByRecent(lhs: Note, rhs: Note): number {
  const updatedDelta = toTimestamp(rhs.updatedAt) - toTimestamp(lhs.updatedAt);
  if (updatedDelta !== 0) {
    return updatedDelta;
  }

  return toTimestamp(rhs.createdAt) - toTimestamp(lhs.createdAt);
}

export function useRecentNotes() {
  const notes = useLiveQuery(
    () => db.notes.orderBy("updatedAt").reverse().toArray(),
    [],
  );

  const recentNotes = useMemo(() => {
    return [...(notes || [])].filter((n) => !n.deletedAt).sort(sortByRecent);
  }, [notes]);

  return {
    notes: recentNotes,
    isLoading: notes === undefined,
  };
}
