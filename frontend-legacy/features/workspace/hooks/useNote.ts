"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/features/storage";
import type { Note } from "../types/workspace.types";

/**
 * Live query for a single note by ID.
 * Auto-re-renders whenever the note is updated in Dexie.
 *
 * For optimistic updates (title, emoji, cover), callers should
 * use noteService.updateNote() which writes to Dexie — useLiveQuery
 * will pick up the change automatically.
 */
export function useNote(params: {
  id?: string;
  initialNote?: Note;
  readonly?: boolean;
}): { note: Note | undefined; loading: boolean } {
  const { id } = params;

  const note = useLiveQuery(() => (id ? db.notes.get(id) : undefined), [id]);

  return {
    note,
    // useLiveQuery returns undefined while the query is pending
    loading: note === undefined && id !== undefined,
  };
}
