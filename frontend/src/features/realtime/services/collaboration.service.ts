import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/constants/app.constants";
import { storageService, STORAGE_KEYS } from "@/features/storage";
import { logService } from "@/services/log.service";
import {
  COLLABORATION_EVENTS,
  COLLABORATION_CONFIG,
  CONNECTION_STATE,
} from "../constants/collaboration.constants";
import type {
  ReceiveUpdatePayload,
  CatchupUpdatesPayload,
  RoomUsersPayload,
  UserPresencePayload,
  AwarenessPayload,
  CollaborationConnectionState,
} from "../types/collaboration.types";
import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces";

/** Callback types for collaboration events */
interface CollaborationCallbacks {
  onUpdate: (update: Uint8Array, senderId: string) => void;
  onAwareness: (awareness: Uint8Array) => void;
  onUsersChanged: (users: RoomUsersPayload["users"]) => void;
  onConnectionStateChange: (state: CollaborationConnectionState) => void;
}

/**
 * Singleton service managing the WebSocket connection for real-time
 * collaborative editing with encrypted Yjs CRDT updates.
 *
 * Data flow:
 * 1. Client edits → Yjs produces binary update
 * 2. This service encrypts the update with the space key (AES-GCM)
 * 3. Encrypted update sent to server via WebSocket
 * 4. Server stores opaque blob + relays to other clients in the room
 * 5. This service decrypts incoming updates
 * 6. Decrypted update applied to local Yjs doc
 *
 * The server NEVER sees plaintext. Zero-knowledge relay.
 */
class CollaborationService {
  private socket: Socket | null = null;
  private currentNoteId: string | null = null;
  private currentSpaceId: string | null = null;
  private callbacks: CollaborationCallbacks | null = null;
  private lastSequenceNumber = 0;
  private connectionState: CollaborationConnectionState =
    CONNECTION_STATE.DISCONNECTED;

  /**
   * Connects to the collaboration WebSocket server.
   * Called once when the app initializes a collaborative editing session.
   */
  async connect(): Promise<void> {
    if (this.isConnected) return;

    const token = await storageService.get<string>(STORAGE_KEYS.JWT_KEY);
    if (!token) {
      logService.warn(
        "CollaborationService: No JWT token, skipping WS connect",
      );
      return;
    }

    this.setConnectionState(CONNECTION_STATE.CONNECTING);

    this.socket = io(`${API_BASE_URL}${COLLABORATION_CONFIG.NAMESPACE}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: COLLABORATION_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: COLLABORATION_CONFIG.RECONNECT_DELAY_MS,
      reconnectionDelayMax: COLLABORATION_CONFIG.MAX_RECONNECT_DELAY_MS,
    });

    this.setupSocketListeners();
  }

  /**
   * Joins a note room for collaborative editing.
   * Sets up encryption/decryption with the note's space key.
   */
  async joinNote(
    noteId: string,
    spaceId: string,
    callbacks: CollaborationCallbacks,
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    // Leave previous note if any
    if (this.currentNoteId && this.currentNoteId !== noteId) {
      this.leaveNote();
    }

    this.currentNoteId = noteId;
    this.currentSpaceId = spaceId;
    this.callbacks = callbacks;
    this.lastSequenceNumber = 0;

    // Immediately notify the newly registered callback of the current connection state.
    // This is critical for React StrictMode and component remounts where the socket
    // is already connected and the "connect" event will not fire again.
    this.callbacks.onConnectionStateChange(this.connectionState);

    this.emitEvent(COLLABORATION_EVENTS.JOIN_NOTE, {
      noteId,
      spaceId,
    });

    logService.info(`Joined collaboration for note ${noteId}`);
  }

  /**
   * Leaves the current note room.
   */
  leaveNote(): void {
    if (this.currentNoteId && this.isConnected) {
      this.emitEvent(COLLABORATION_EVENTS.LEAVE_NOTE, {
        noteId: this.currentNoteId,
      });
      logService.info(`Left collaboration for note ${this.currentNoteId}`);
    }

    this.currentNoteId = null;
    this.currentSpaceId = null;
    this.callbacks = null;
    this.lastSequenceNumber = 0;
  }

  /**
   * Encrypts and sends a Yjs update to the server for relay.
   */
  async sendUpdate(update: Uint8Array): Promise<void> {
    if (!this.isConnected || !this.currentNoteId || !this.currentSpaceId) {
      return;
    }

    try {
      const spaceKeyBytes = await spaceService.getSpaceKeyBytes(
        this.currentSpaceId,
      );

      // Convert Uint8Array to base64 string, then encrypt
      const updateBase64 = cryptoService.encodeBase64(
        update.buffer as ArrayBuffer,
      );
      const encryptedUpdate = await cryptoService.encryptString(
        updateBase64,
        spaceKeyBytes,
      );

      this.emitEvent(COLLABORATION_EVENTS.SEND_UPDATE, {
        noteId: this.currentNoteId,
        encryptedUpdate,
      });
    } catch (err) {
      logService.error("Failed to encrypt/send Yjs update", err);
    }
  }

  /**
   * Encrypts and sends awareness state (cursor position, user info).
   */
  async sendAwareness(awareness: Uint8Array): Promise<void> {
    if (!this.isConnected || !this.currentNoteId || !this.currentSpaceId) {
      return;
    }

    try {
      const spaceKeyBytes = await spaceService.getSpaceKeyBytes(
        this.currentSpaceId,
      );

      const awarenessBase64 = cryptoService.encodeBase64(
        awareness.buffer as ArrayBuffer,
      );
      const encryptedAwareness = await cryptoService.encryptString(
        awarenessBase64,
        spaceKeyBytes,
      );

      this.emitEvent(COLLABORATION_EVENTS.SEND_AWARENESS, {
        noteId: this.currentNoteId,
        encryptedAwareness,
      });
    } catch (err) {
      logService.error("Failed to encrypt/send awareness", err);
    }
  }

  /**
   * Requests missed updates after reconnecting.
   */
  requestCatchup(noteId: string): void {
    this.emitEvent(COLLABORATION_EVENTS.REQUEST_CATCHUP, {
      noteId,
      lastSequenceNumber: this.lastSequenceNumber,
    });
  }

  /**
   * Disconnects the WebSocket connection entirely.
   */
  disconnect(): void {
    this.leaveNote();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setConnectionState(CONNECTION_STATE.DISCONNECTED);
    logService.info("Collaboration WebSocket disconnected");
  }

  /** Current connection state */
  get state(): CollaborationConnectionState {
    return this.connectionState;
  }

  /** Whether the socket is currently connected */
  get isConnected(): boolean {
    return this?.socket?.connected ?? false;
  }

  // ─── Private ──────────────────────────────────────────

  /**
   * Centralised socket emit — guards against null socket so callers
   * never need optional chaining or bare access on this.socket.
   */
  private emitEvent(event: string, payload: unknown): void {
    if (!this.socket) {
      logService.warn(
        `CollaborationService: Cannot emit "${event}" — socket is null`,
      );
      return;
    }
    this.socket.emit(event, payload);
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.setConnectionState(CONNECTION_STATE.CONNECTED);
      logService.info("Collaboration WebSocket connected");

      // Request catch-up if we were in a room
      if (this.currentNoteId) {
        this.requestCatchup(this.currentNoteId);
      }
    });

    this.socket.on("disconnect", () => {
      this.setConnectionState(CONNECTION_STATE.DISCONNECTED);
      logService.warn("Collaboration WebSocket disconnected");
    });

    this.socket.on("reconnect_attempt", () => {
      this.setConnectionState(CONNECTION_STATE.RECONNECTING);
    });

    this.socket.on("reconnect", () => {
      this.setConnectionState(CONNECTION_STATE.CONNECTED);

      // Re-join the current note room after reconnect
      if (this.currentNoteId && this.currentSpaceId) {
        this.socket?.emit(COLLABORATION_EVENTS.JOIN_NOTE, {
          noteId: this.currentNoteId,
          spaceId: this.currentSpaceId,
        });
        this.requestCatchup(this.currentNoteId);
      }
    });

    // Receive encrypted Yjs update from another user
    this.socket.on(
      COLLABORATION_EVENTS.RECEIVE_UPDATE,
      (payload: ReceiveUpdatePayload) => {
        void this.handleReceiveUpdate(payload);
      },
    );

    // Receive catch-up batch
    this.socket.on(
      COLLABORATION_EVENTS.CATCHUP_UPDATES,
      (payload: CatchupUpdatesPayload) => {
        void this.handleCatchupUpdates(payload);
      },
    );

    // Receive awareness from another user
    this.socket.on(
      COLLABORATION_EVENTS.RECEIVE_AWARENESS,
      (payload: AwarenessPayload) => {
        void this.handleReceiveAwareness(payload);
      },
    );

    // Room presence events
    this.socket.on(
      COLLABORATION_EVENTS.ROOM_USERS,
      (payload: RoomUsersPayload) => {
        this.callbacks?.onUsersChanged(payload.users);
      },
    );

    this.socket.on(
      COLLABORATION_EVENTS.USER_JOINED,
      (_payload: UserPresencePayload) => {
        // Could trigger a UI notification
      },
    );

    this.socket.on(
      COLLABORATION_EVENTS.USER_LEFT,
      (_payload: UserPresencePayload) => {
        // Could trigger a UI notification
      },
    );
  }

  /**
   * Decrypts an incoming Yjs update and forwards to the Yjs doc.
   */
  private async handleReceiveUpdate(
    payload: ReceiveUpdatePayload,
  ): Promise<void> {
    if (payload.noteId !== this.currentNoteId || !this.currentSpaceId) return;

    try {
      const spaceKeyBytes = await spaceService.getSpaceKeyBytes(
        this.currentSpaceId,
      );

      // Decrypt the update
      const updateBase64 = await cryptoService.decryptString(
        payload.encryptedUpdate,
        spaceKeyBytes,
      );

      // Convert base64 back to Uint8Array
      const updateBuffer = cryptoService.decodeBase64(updateBase64);
      const update = new Uint8Array(updateBuffer);

      // Track sequence number for catch-up
      this.lastSequenceNumber = Math.max(
        this.lastSequenceNumber,
        payload.sequenceNumber,
      );

      // Forward to the Yjs doc via callback
      this.callbacks?.onUpdate(update, payload.senderId);
    } catch (err) {
      logService.error("Failed to decrypt incoming Yjs update", err);
    }
  }

  /**
   * Handles a batch of catch-up updates after reconnect.
   */
  private async handleCatchupUpdates(
    payload: CatchupUpdatesPayload,
  ): Promise<void> {
    if (payload.noteId !== this.currentNoteId) return;

    for (const update of payload.updates) {
      await this.handleReceiveUpdate(update);
    }

    logService.info(
      `Applied ${payload.updates.length} catch-up updates for note ${payload.noteId}`,
    );
  }

  /**
   * Decrypts incoming awareness state and forwards to the Yjs doc.
   */
  private async handleReceiveAwareness(
    payload: AwarenessPayload,
  ): Promise<void> {
    if (payload.noteId !== this.currentNoteId || !this.currentSpaceId) return;

    try {
      const spaceKeyBytes = await spaceService.getSpaceKeyBytes(
        this.currentSpaceId,
      );

      const awarenessBase64 = await cryptoService.decryptString(
        payload.encryptedAwareness,
        spaceKeyBytes,
      );

      const awarenessBuffer = cryptoService.decodeBase64(awarenessBase64);
      const awareness = new Uint8Array(awarenessBuffer);

      this.callbacks?.onAwareness(awareness);
    } catch (err) {
      logService.error("Failed to decrypt awareness", err);
    }
  }

  private setConnectionState(state: CollaborationConnectionState): void {
    this.connectionState = state;
    this.callbacks?.onConnectionStateChange(state);
  }
}

export const collaborationService = new CollaborationService();
