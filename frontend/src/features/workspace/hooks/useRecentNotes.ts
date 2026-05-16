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

/**
 * Returns recent notes, optionally filtered by spaceId.
 * When spaceId is null or undefined, returns all notes (All Spaces).
 */
export function useRecentNotes(spaceId?: string | null) {
  const notes = useLiveQuery(() => NoteLocalService.all(), []);

  const recentNotes = useMemo(() => {
    let filtered = [...(notes || [])].filter((n) => !n.deletedAt);

    if (spaceId) {
      filtered = filtered.filter((n) => n.spaceId === spaceId);
    }

    return filtered.sort(sortByRecent);
  }, [notes, spaceId]);

  return {
    notes: recentNotes,
    isLoading: notes === undefined,
  };
}
