import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Note } from "@/features/workspace/types/workspace.types";
import { NoteLocalService } from "../services/note-local.service";

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
  const notes = useLiveQuery(() => NoteLocalService.all(), []);

  const recentNotes = useMemo(() => {
    return [...(notes || [])].filter((n) => !n.deletedAt).sort(sortByRecent);
  }, [notes]);

  return {
    notes: recentNotes,
    isLoading: notes === undefined,
  };
}
