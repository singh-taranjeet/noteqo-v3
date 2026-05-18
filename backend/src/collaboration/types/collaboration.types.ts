/** Payload sent by a client when joining a note room */
export interface JoinNotePayload {
  noteId: string;
  spaceId: string;
}

/** Payload sent by a client when leaving a note room */
export interface LeaveNotePayload {
  noteId: string;
}

/** Payload for sending an encrypted Yjs update */
export interface SendUpdatePayload {
  noteId: string;
  /** Base64-encoded AES-GCM encrypted Yjs update (iv:ciphertext) */
  encryptedUpdate: string;
}

/** Payload relayed to other clients in the note room */
export interface ReceiveUpdatePayload {
  noteId: string;
  /** Base64-encoded AES-GCM encrypted Yjs update (iv:ciphertext) */
  encryptedUpdate: string;
  /** Sequence number for ordering and catch-up */
  sequenceNumber: number;
  /** User ID of the sender */
  senderId: string;
}

/** Payload for requesting missed updates after reconnect */
export interface RequestCatchupPayload {
  noteId: string;
  /** The last sequence number the client has received */
  lastSequenceNumber: number;
}

/** Payload for catch-up response with missed updates */
export interface CatchupUpdatesPayload {
  noteId: string;
  updates: ReceiveUpdatePayload[];
}

/** Payload for broadcasting/receiving encrypted awareness state */
export interface AwarenessPayload {
  noteId: string;
  /** Base64-encoded encrypted awareness state */
  encryptedAwareness: string;
}

/** Info about a user currently in a note room */
export interface RoomUser {
  userId: string;
  joinedAt: string;
}

/** Payload for room user presence events */
export interface RoomUsersPayload {
  noteId: string;
  users: RoomUser[];
}

/** Payload for user joined/left events */
export interface UserPresencePayload {
  noteId: string;
  userId: string;
}

/** Socket authentication data extracted from JWT */
export interface SocketAuthData {
  userId: string;
  email: string;
}
