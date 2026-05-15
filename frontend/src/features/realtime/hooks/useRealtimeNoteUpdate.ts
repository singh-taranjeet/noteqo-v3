import { useEffect } from "react";
import type { RealtimeNoteEvent } from "../types/realtime.types";
import { REALTIME_EVENT_NAMES } from "../constants/realtime.constants";

/**
 * Listens for real-time NOTE_UPDATED events from other users via SSE.
 * When the specified note is updated remotely, calls the provided callback
 * so the caller can re-fetch and update the local state.
 *
 * Events from the current user are already filtered out server-side.
 */
export function useRealtimeNoteUpdate(
  noteId: string | undefined,
  onUpdate: (event: RealtimeNoteEvent) => void,
): void {
  useEffect(() => {
    if (!noteId) return;

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<RealtimeNoteEvent>).detail;
      if (detail.noteId === noteId) {
        onUpdate(detail);
      }
    };

    const eventName = `noteqo:realtime:${REALTIME_EVENT_NAMES.NOTE_UPDATED}`;
    globalThis.addEventListener(eventName, handleUpdate);

    return () => {
      globalThis.removeEventListener(eventName, handleUpdate);
    };
  }, [noteId, onUpdate]);
}
