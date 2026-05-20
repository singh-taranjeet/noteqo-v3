// Public API for the Realtime feature

// --- SSE (structural events: note created, deleted, space updates) ---
export { eventSourceService } from "./services/event-source.service";
export { useRealtimeNoteUpdate } from "./hooks/useRealtimeNoteUpdate";
export { useRealtimeConnection } from "./hooks/useRealtimeConnection";
export { RealtimeProvider } from "./components/RealtimeProvider";
export type {
  RealtimeNoteEvent,
  RealtimeEventType,
} from "./types/realtime.types";

// --- WebSocket Collaboration (Yjs CRDT real-time editing) ---
export { collaborationService } from "./services/collaboration.service";
export type {
  CollaborationConnectionState,
  RoomUser,
  ReceiveUpdatePayload,
  SendUpdatePayload,
} from "./types/collaboration.types";
export {
  COLLABORATION_EVENTS,
  COLLABORATION_CONFIG,
  CONNECTION_STATE,
} from "./constants/collaboration.constants";
