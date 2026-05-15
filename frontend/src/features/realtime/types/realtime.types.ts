/** Event types received from the SSE stream */
export type RealtimeEventType =
  | "NOTE_CREATED"
  | "NOTE_UPDATED"
  | "NOTE_DELETED"
  | "NOTE_RESTORED";

/**
 * Lightweight event received via SSE.
 * Does NOT include note content — the client must fetch + decrypt separately.
 */
export interface RealtimeNoteEvent {
  type: RealtimeEventType;
  noteId: string;
  spaceId: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}
