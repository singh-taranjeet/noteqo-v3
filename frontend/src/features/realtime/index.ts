// Public API for the Realtime feature
export { eventSourceService } from "./services/event-source.service";
export { useRealtimeNoteUpdate } from "./hooks/useRealtimeNoteUpdate";
export { useRealtimeConnection } from "./hooks/useRealtimeConnection";
export { RealtimeProvider } from "./components/RealtimeProvider";
export type {
  RealtimeNoteEvent,
  RealtimeEventType,
} from "./types/realtime.types";
