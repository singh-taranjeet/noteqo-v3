import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import { collaborationService } from "../services/collaboration.service";
import { logService } from "@/services/log.service";
import { yjsPersistenceService } from "@/features/storage/services/yjs-persistence.service";
import { COLLABORATION_CONFIG } from "../constants/collaboration.constants";
import type {
  CollaborationConnectionState,
  RoomUser,
} from "../types/collaboration.types";

export interface EncryptedYjsProviderOptions {
  /** The Yjs document to synchronize */
  doc: Y.Doc;
  /** Note ID for room management */
  noteId: string;
  /** Space ID for encryption key resolution */
  spaceId: string;
  /** Callback when connection state changes */
  onConnectionStateChange?: (state: CollaborationConnectionState) => void;
  /** Callback when room users change */
  onUsersChanged?: (users: RoomUser[]) => void;
}

/**
 * Custom Yjs provider that bridges Yjs ↔ Encrypted WebSocket relay.
 *
 * This replaces `y-websocket`'s built-in provider because we need to
 * encrypt/decrypt Yjs updates with the space key before sending/receiving.
 *
 * Lifecycle:
 * 1. Load persisted Yjs state from Dexie (offline-first)
 * 2. Connect to WebSocket room
 * 3. Request catch-up for any missed updates
 * 4. Listen for local Yjs updates → encrypt → send
 * 5. Listen for remote updates → decrypt → apply
 * 6. Periodically persist Yjs state to Dexie
 */
export class EncryptedYjsProvider {
  readonly doc: Y.Doc;
  readonly awareness: Awareness;
  private readonly noteId: string;
  private readonly spaceId: string;
  private persistTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;
  private onConnectionStateChange?: (
    state: CollaborationConnectionState,
  ) => void;
  private onUsersChanged?: (users: RoomUser[]) => void;

  constructor(options: EncryptedYjsProviderOptions) {
    this.doc = options.doc;
    this.noteId = options.noteId;
    this.spaceId = options.spaceId;
    this.onConnectionStateChange = options.onConnectionStateChange;
    this.onUsersChanged = options.onUsersChanged;

    // Create awareness instance for cursor/user presence
    this.awareness = new Awareness(this.doc);

    // Set up Yjs update listener → encrypt and send
    this.doc.on("update", this.handleLocalUpdate);

    // Set up awareness change listener → encrypt and send
    this.awareness.on("update", this.handleAwarenessUpdate);

    // Initialize async
    void this.initialize();
  }

  /**
   * Initializes the provider:
   * 1. Loads persisted Yjs state from Dexie
   * 2. Connects to the collaboration WebSocket
   * 3. Starts periodic Dexie persistence
   */
  private async initialize(): Promise<void> {
    try {
      // 1. Load persisted state from Dexie (offline-first)
      await yjsPersistenceService.loadState(this.noteId, this.doc);

      // 2. Connect to collaboration room
      await collaborationService.joinNote(this.noteId, this.spaceId, {
        onUpdate: this.handleRemoteUpdate,
        onAwareness: this.handleRemoteAwareness,
        onUsersChanged: (users) => this.onUsersChanged?.(users),
        onConnectionStateChange: (state) =>
          this.onConnectionStateChange?.(state),
      });

      // 3. Start periodic persistence to Dexie
      this.startPersistence();

      logService.info(
        `EncryptedYjsProvider initialized for note ${this.noteId}`,
      );
    } catch (err) {
      logService.error("Failed to initialize EncryptedYjsProvider", err);
    }
  }

  /**
   * Handles a local Yjs update (from TipTap edits).
   * Encrypts the update and sends it to the server.
   */
  private handleLocalUpdate = (update: Uint8Array, origin: unknown): void => {
    // Skip updates that originated from remote (to avoid echo)
    if (origin === "remote" || this.isDestroyed) return;

    void collaborationService.sendUpdate(update);
  };

  /**
   * Handles a remote Yjs update received from the server.
   * Applies it to the local Yjs doc with 'remote' origin to prevent echo.
   */
  private handleRemoteUpdate = (
    update: Uint8Array,
    _senderId: string,
  ): void => {
    if (this.isDestroyed) return;

    Y.applyUpdate(this.doc, update, "remote");
  };

  /**
   * Handles local awareness changes (cursor position, user info).
   * Encrypts and sends to the server.
   */
  private handleAwarenessUpdate = (
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    _origin: unknown,
  ): void => {
    if (this.isDestroyed) return;

    const changedClients = added.concat(updated).concat(removed);
    const encodedAwareness =
      Awareness.prototype.constructor === Awareness
        ? this.encodeAwarenessState(changedClients)
        : null;

    if (encodedAwareness) {
      void collaborationService.sendAwareness(encodedAwareness);
    }
  };

  /**
   * Handles remote awareness state received from the server.
   */
  private handleRemoteAwareness = (awareness: Uint8Array): void => {
    if (this.isDestroyed) return;

    try {
      applyAwarenessUpdate(this.awareness, awareness, "remote");
    } catch (err) {
      logService.error("Failed to apply remote awareness", err);
    }
  };

  /**
   * Starts periodic persistence of Yjs state to Dexie.
   */
  private startPersistence(): void {
    this.persistTimer = setInterval(() => {
      if (!this.isDestroyed) {
        void yjsPersistenceService.saveState(this.noteId, this.doc);
      }
    }, COLLABORATION_CONFIG.LOCAL_PERSISTENCE_INTERVAL_MS);
  }

  /**
   * Encodes the current awareness state for the given client IDs.
   */
  private encodeAwarenessState(changedClients: number[]): Uint8Array | null {
    try {
      return encodeAwarenessUpdate(this.awareness, changedClients);
    } catch {
      return null;
    }
  }

  /**
   * Cleans up all listeners, timers, and connections.
   * Call this when the editor is unmounted.
   */
  destroy(): void {
    this.isDestroyed = true;

    // Save final state to Dexie before destroying
    void yjsPersistenceService.saveState(this.noteId, this.doc);

    // Stop persistence timer
    if (this.persistTimer) {
      clearInterval(this.persistTimer);
      this.persistTimer = null;
    }

    // Remove Yjs listeners
    this.doc.off("update", this.handleLocalUpdate);
    this.awareness.off("update", this.handleAwarenessUpdate);

    // Leave the collaboration room
    collaborationService.leaveNote();

    // Destroy awareness
    this.awareness.destroy();

    logService.info(`EncryptedYjsProvider destroyed for note ${this.noteId}`);
  }
}
