import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useQuery } from "@tanstack/react-query";
import type { Note } from "../types/workspace.types";
import { noteApiService } from "../services/note-api.service";
import { QueryKeys } from "@/features/shared/constants/index.shared.constants";
import { useRealtimeNoteUpdate } from "@/features/realtime";
import { NoteLocalService } from "../services/note-local.service";

/**
 * Live query for a single note by ID.
 * Auto-re-renders whenever the note is updated in Dexie.
 *
 * For optimistic updates (title, emoji, cover), callers should
 * use noteService.updateNote() which writes to Dexie — useLiveQuery
 * will pick up the change automatically.
 *
 * Also listens for real-time SSE events from other users editing
 * the same note and re-fetches the latest version automatically.
 */
export function useNote(params: {
  id?: string;
  initialNote?: Note;
  readonly?: boolean;
}): { note: Note | undefined; loading: boolean } {
  const { id = "" } = params;

  // This will fetch remote note and also update in the local db
  useQuery({
    queryKey: QueryKeys.notes.remote.get(id),
    queryFn: async () => {
      if (!id) return null;
      await noteApiService.handleInboundNote({ noteId: id, version: Infinity });
      return { syncedAt: new Date().toISOString() };
    },
    staleTime: 0,
    enabled: !!id,
  });

  // Listen for real-time updates from other users via SSE
  const handleRealtimeUpdate = useCallback(
    async (event: { noteId: string; version: number }) => {
      if (!id || !event) return;
      await noteApiService.handleInboundNote({
        noteId: event.noteId,
        version: event.version,
      });
    },
    [id],
  );

  useRealtimeNoteUpdate(id || undefined, handleRealtimeUpdate);

  const note = useLiveQuery(
    () => (id ? NoteLocalService.get(id) : undefined),
    [id],
  );

  return {
    note,
    // useLiveQuery returns undefined while the query is pending
    loading: note === undefined && id !== undefined,
  };
}
