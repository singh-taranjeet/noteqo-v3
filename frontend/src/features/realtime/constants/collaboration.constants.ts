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
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
  ] as readonly string[],
} as const;
