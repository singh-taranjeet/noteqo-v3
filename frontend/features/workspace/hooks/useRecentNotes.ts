"use client";
import { useEffect, useMemo, useState } from "react";
import { noteService } from "@/features/workspace/services/note.service";
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      setIsLoading(true);
      const data = await noteService.getAllLocalNotes();
      setNotes(data);
      setIsLoading(false);
    }
    loadNotes();
  }, []);

  const recentNotes = useMemo(() => {
    return [...notes].filter((n) => !n.deletedAt).sort(sortByRecent);
  }, [notes]);

  return {
    notes: recentNotes,
    isLoading,
  };
}
