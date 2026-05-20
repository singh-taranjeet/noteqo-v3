import { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from "y-protocols/awareness";
import { cryptoService } from "@/features/crypto";
import { collaborationService } from "../services/collaboration.service";
import type {
  CollaborationConnectionState,
  RoomUser,
} from "../types/collaboration.types";
import { COLLABORATION_CONFIG, CONNECTION_STATE } from "../constants/collaboration.constants";
import { logService } from "@/services/log.service";
import { storageService, STORAGE_KEYS } from "@/features/storage";

interface UseCRDTOptions {
  noteId: string;
  spaceId: string | null;
  isReadOnly: boolean;
  initialYjsState?: string;
}

export interface UseCRDTReturn {
  ydoc: Y.Doc | null;
  awareness: Awareness | null;
  connectionState: CollaborationConnectionState;
  roomUsers: RoomUser[];
  isCollaborating: boolean;
  userColor: string;
  isReady: boolean;
}

/**
 * Re-created CRDT Pipeline Hook from scratch.
 *
 * Responsibilities:
 * 1. Initialize Y.Doc and Awareness.
 * 2. Hydrate offline Y.Doc state strictly from the note entity's unified persistence.
 * 3. Connect to the WebSocket room via collaborationService.
 * 4. Intercept all outgoing Yjs updates -> AES-GCM Encrypt with Space Key -> Send.
 * 5. Intercept all incoming encrypted updates -> AES-GCM Decrypt -> Apply to Y.Doc.
 * 6. Handle Awareness (Cursors) similarly.
 */
export function useCRDT({
  noteId,
  spaceId,
  isReadOnly,
  initialYjsState,
}: UseCRDTOptions): UseCRDTReturn {
  const shouldCollaborate = !isReadOnly && !!spaceId;

  // Initialize strictly once
  const [ydoc] = useState<Y.Doc | null>(() =>
    shouldCollaborate ? new Y.Doc() : null,
  );
  const [awareness] = useState<Awareness | null>(() =>
    ydoc ? new Awareness(ydoc) : null,
  );

  const [connectionState, setConnectionState] =
    useState<CollaborationConnectionState>(CONNECTION_STATE.DISCONNECTED);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [isReady, setIsReady] = useState(false);

  const [userColor] = useState(
    () =>
      COLLABORATION_CONFIG.USER_COLORS[
        Math.floor(Math.random() * COLLABORATION_CONFIG.USER_COLORS.length)
      ],
  );

  const isDestroyedRef = useRef(false);

  useEffect(() => {
    if (!shouldCollaborate || !ydoc || !awareness || !spaceId || !noteId) {
      setIsReady(true);
      return;
    }

    isDestroyedRef.current = false;

    // Set awareness user profile
    const setupAwareness = async () => {
      const profile = await storageService.get<{ email?: string }>(
        STORAGE_KEYS.USER_PROFILE,
      );
      if (profile?.email && !isDestroyedRef.current) {
        awareness.setLocalStateField("user", {
          name: profile.email.split("@")[0] || "User",
          color: userColor,
        });
      }
    };
    void setupAwareness();

    const initializePipeline = async () => {
      // 1. Hydrate offline state seamlessly
      if (initialYjsState) {
        try {
          const stateBuffer = cryptoService.decodeBase64(initialYjsState);
          const state = new Uint8Array(stateBuffer);
          Y.applyUpdate(ydoc, state);
          logService.info(
            `CRDT Pipeline: Hydrated ${state.byteLength} bytes for offline support.`,
          );
        } catch (e) {
          logService.error(
            "CRDT Pipeline: Failed to hydrate offline state.",
            e,
          );
        }
      }

      setIsReady(true);

      // 2. Setup E2E Encrypted WebSockets
      await collaborationService.joinNote(noteId, spaceId, {
        onUpdate: async (encryptedUpdate: Uint8Array, _senderId: string) => {
          if (isDestroyedRef.current) return;
          try {
            Y.applyUpdate(ydoc, encryptedUpdate, "remote");
          } catch (e) {
            logService.error(
              "CRDT Pipeline: Failed to apply remote update.",
              e,
            );
          }
        },
        onAwareness: async (awarenessUpdate: Uint8Array) => {
          if (isDestroyedRef.current) return;
          try {
            applyAwarenessUpdate(awareness, awarenessUpdate, "remote");
          } catch (e) {
            logService.error(
              "CRDT Pipeline: Failed to apply remote awareness.",
              e,
            );
          }
        },
        onUsersChanged: setRoomUsers,
        onConnectionStateChange: setConnectionState,
      });

      // 3. E2E Encrypt Outgoing Updates (handled by collaborationService)
      const handleLocalUpdate = async (update: Uint8Array, origin: unknown) => {
        if (origin === "remote" || isDestroyedRef.current) return;
        try {
          await collaborationService.sendUpdate(update);
        } catch (e) {
          logService.error(
            "CRDT Pipeline: Encryption failed for local update.",
            e,
          );
        }
      };

      const handleLocalAwareness = async (
        { added, updated, removed }: Record<string, number[]>,
        _origin: unknown,
      ) => {
        if (isDestroyedRef.current) return;
        const changedClients = added.concat(updated).concat(removed);
        try {
          const state = encodeAwarenessUpdate(awareness, changedClients);
          await collaborationService.sendAwareness(state);
        } catch {
          // ignore error
        }
      };

      ydoc.on("update", handleLocalUpdate);
      awareness.on("update", handleLocalAwareness);
    };

    void initializePipeline();

    return () => {
      isDestroyedRef.current = true;
      collaborationService.leaveNote();
      setConnectionState(CONNECTION_STATE.DISCONNECTED);
      setRoomUsers([]);
    };
  }, [
    noteId,
    spaceId,
    shouldCollaborate,
    ydoc,
    awareness,
    initialYjsState,
    userColor,
  ]);

  return {
    ydoc,
    awareness,
    connectionState,
    roomUsers,
    isCollaborating: shouldCollaborate && connectionState === CONNECTION_STATE.CONNECTED,
    userColor,
    isReady,
  };
}
