/** WebSocket event names — must match backend COLLABORATION_EVENTS */
export const COLLABORATION_EVENTS = {
  JOIN_NOTE: "join-note",
  LEAVE_NOTE: "leave-note",
  SEND_UPDATE: "send-update",
  RECEIVE_UPDATE: "receive-update",
  REQUEST_CATCHUP: "request-catchup",
  CATCHUP_UPDATES: "catchup-updates",
  SEND_AWARENESS: "send-awareness",
  RECEIVE_AWARENESS: "receive-awareness",
  ROOM_USERS: "room-users",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
} as const;

export const COLLABORATION_CONFIG = {
  /** WebSocket namespace — must match backend */
  NAMESPACE: "/collaboration",

  /** Reconnection attempts before giving up */
  MAX_RECONNECT_ATTEMPTS: 10,

  /** Base reconnection delay in ms (doubles on each retry) */
  RECONNECT_DELAY_MS: 1_000,

  /** Max delay between reconnection attempts */
  MAX_RECONNECT_DELAY_MS: 30_000,

  /** Debounce for batching outgoing Yjs updates (ms) */
  UPDATE_BATCH_DEBOUNCE_MS: 50,

  /** How often to persist Yjs state to Dexie (ms) */
  LOCAL_PERSISTENCE_INTERVAL_MS: 5_000,

  /** Default user colors for collaboration cursors */
  USER_COLORS: [
    "var(--user-1)",
    "var(--user-2)",
    "var(--user-3)",
    "var(--user-4)",
    "var(--user-5)",
    "var(--user-6)",
    "var(--user-7)",
    "var(--user-8)",
    "var(--user-9)",
    "var(--user-10)",
  ] as readonly string[],
} as const;

/** Connection state values — use instead of raw string literals */
export const CONNECTION_STATE = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
} as const;
