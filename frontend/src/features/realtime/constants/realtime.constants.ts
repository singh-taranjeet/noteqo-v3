export const REALTIME_CONFIG = {
  /** How long to wait before reconnecting after an EventSource error (ms) */
  RECONNECT_DELAY_MS: 3_000,
} as const;

export const REALTIME_EVENT_NAMES = {
  NOTE_CREATED: "NOTE_CREATED",
  NOTE_UPDATED: "NOTE_UPDATED",
  NOTE_DELETED: "NOTE_DELETED",
  NOTE_RESTORED: "NOTE_RESTORED",
} as const;
