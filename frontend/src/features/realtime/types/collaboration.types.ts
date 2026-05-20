/** Payload for sending an encrypted Yjs update to the server */
export interface SendUpdatePayload {
  noteId: string;
  encryptedUpdate: string;
}

/** Payload received when another client sends a Yjs update */
export interface ReceiveUpdatePayload {
  noteId: string;
  encryptedUpdate: string;
  sequenceNumber: number;
  senderId: string;
}

/** Payload for requesting missed updates */
export interface RequestCatchupPayload {
  noteId: string;
  lastSequenceNumber: number;
}

/** Payload for catch-up response */
export interface CatchupUpdatesPayload {
  noteId: string;
  updates: ReceiveUpdatePayload[];
}

/** Payload for awareness state */
export interface AwarenessPayload {
  noteId: string;
  encryptedAwareness: string;
}

/** Info about a user in a note room */
export interface RoomUser {
  userId: string;
  email: string;
  joinedAt: string;
}

/** Payload for room users list */
export interface RoomUsersPayload {
  noteId: string;
  users: RoomUser[];
}

/** Payload for user join/leave events */
export interface UserPresencePayload {
  noteId: string;
  userId: string;
}

/** Collaboration connection state */
export type CollaborationConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";
