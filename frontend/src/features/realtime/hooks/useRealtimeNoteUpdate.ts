import { useEffect } from "react";
import type { RealtimeNoteEvent } from "../types/realtime.types";
import { REALTIME_EVENT_NAMES } from "../constants/realtime.constants";
import { SYNC_EVENTS } from "@/features/shared/constants/sync-events.constants";

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

    const eventName = SYNC_EVENTS.REAL_TIME_EVENT(REALTIME_EVENT_NAMES.NOTE_UPDATED);
    globalThis.addEventListener(eventName, handleUpdate);

    return () => {
      globalThis.removeEventListener(eventName, handleUpdate);
    };
  }, [noteId, onUpdate]);
}
