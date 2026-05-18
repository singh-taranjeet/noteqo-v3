/** WebSocket gateway configuration */
export const COLLABORATION_CONFIG = {
  /** WebSocket namespace for collaboration events */
  NAMESPACE: 'collaboration',

  /** WebSocket CORS origins — overridden by env in production */
  CORS_ORIGIN: '*',

  /** Room prefix for note-scoped WebSocket rooms */
  ROOM_PREFIX: 'note',

  /** Maximum number of updates to return in a single catch-up request */
  MAX_CATCHUP_UPDATES: 500,

  /** Retention period for Yjs updates in days */
  UPDATE_RETENTION_DAYS: 10,

  /** How often to run cleanup of expired updates (ms) — every 6 hours */
  CLEANUP_INTERVAL_MS: 6 * 60 * 60 * 1000,
} as const;

/** WebSocket event names exchanged between client ↔ server */
export const COLLABORATION_EVENTS = {
  /** Client → Server: join a note room */
  JOIN_NOTE: 'join-note',

  /** Client → Server: leave a note room */
  LEAVE_NOTE: 'leave-note',

  /** Client → Server: send an encrypted Yjs update */
  SEND_UPDATE: 'send-update',

  /** Server → Client: relay an encrypted Yjs update from another user */
  RECEIVE_UPDATE: 'receive-update',

  /** Client → Server: request missed updates after reconnect */
  REQUEST_CATCHUP: 'request-catchup',

  /** Server → Client: batch of missed encrypted updates for catch-up */
  CATCHUP_UPDATES: 'catchup-updates',

  /** Client → Server: broadcast encrypted awareness state */
  SEND_AWARENESS: 'send-awareness',

  /** Server → Client: relay encrypted awareness from another user */
  RECEIVE_AWARENESS: 'receive-awareness',

  /** Server → Client: list of users currently in the note room */
  ROOM_USERS: 'room-users',

  /** Server → Client: a user joined the note room */
  USER_JOINED: 'user-joined',

  /** Server → Client: a user left the note room */
  USER_LEFT: 'user-left',
} as const;

/** Database table/column constants for the yjs_updates table */
export const YJS_UPDATE_TABLE = { NAME: 'yjs_updates' } as const;

export const YJS_UPDATE_COLUMN = {
  ID: 'id',
  NOTE_ID: 'note_id',
  ENCRYPTED_UPDATE: 'encrypted_update',
  SEQUENCE_NUMBER: 'sequence_number',
  IS_COMPACTED: 'is_compacted',
} as const;

/** Route constants for REST endpoints */
export const COLLABORATION_ROUTES = {
  BASE: 'collaboration',
  COMPACT: ':noteId/compact',
} as const;
