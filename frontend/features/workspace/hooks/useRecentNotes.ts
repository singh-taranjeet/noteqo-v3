"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import type { Note } from "../types/workspace.types";
import { SEARCH_CONFIG } from "@/components/layout/Sidebar/constants/search.constants";

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
  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: RECENT_NOTES_QUERY_KEY,
    queryFn: () => noteService.getAllLocalNotes(),
    refetchInterval: SEARCH_CONFIG.LOCAL_REFRESH_INTERVAL_MS,
  });

  const recentNotes = useMemo(() => {
    return [...notes].filter((n) => !n.deletedAt).sort(sortByRecent);
  }, [notes]);

  return {
    notes: recentNotes,
    isLoading,
    error,
  };
}
