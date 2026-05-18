import { useEffect, useState } from "react";
import * as Y from "yjs";
import { EncryptedYjsProvider } from "@/features/realtime/providers/EncryptedYjsProvider";
import { Awareness } from "y-protocols/awareness";
import type {
  CollaborationConnectionState,
  RoomUser,
} from "@/features/realtime/types/collaboration.types";
import { COLLABORATION_CONFIG } from "@/features/realtime/constants/collaboration.constants";
import { logService } from "@/services/log.service";

export interface UseCollaborationOptions {
  /** Note ID for the collaborative session */
  noteId: string;
  /** Space ID for encryption key resolution */
  spaceId: string | null;
  /** Whether the editor is read-only (no collaboration needed) */
  isReadOnly: boolean;
}

export interface UseCollaborationReturn {
  /** The Yjs document instance for TipTap Collaboration extension */
  ydoc: Y.Doc | null;
  /** The Yjs awareness instance for cursor support */
  awareness: Awareness | null;
  /** The Yjs provider */
  provider: EncryptedYjsProvider | null;
  /** Current WebSocket connection state */
  connectionState: CollaborationConnectionState;
  /** List of users currently in the collaborative session */
  roomUsers: RoomUser[];
  /** Whether collaboration is active */
  isCollaborating: boolean;
  /** User's collaboration color for cursor display */
  userColor: string;
}

/**
 * Hook that manages the Yjs collaboration lifecycle for a note.
 *
 * Creates a Yjs document + encrypted provider when entering a shared note,
 * and destroys them when leaving. Only activates for shared spaces.
 *
 * Uses useState (not useRef) so the parent re-renders when ydoc/provider
 * become available — this is critical for TipTap's extension initialization.
 */
export function useCollaboration({
  noteId,
  spaceId,
  isReadOnly,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [connectionState, setConnectionState] =
    useState<CollaborationConnectionState>("disconnected");
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const shouldCollaborate = !isReadOnly && !!spaceId;

  // Initialize Yjs document and awareness synchronously on first render if needed.
  // This prevents Tiptap from crashing during dynamic reconfiguration of extensions.
  const [ydoc] = useState<Y.Doc | null>(() =>
    shouldCollaborate ? new Y.Doc() : null,
  );
  const [awareness] = useState<Awareness | null>(() =>
    ydoc ? new Awareness(ydoc) : null,
  );
  const [provider, setProvider] = useState<EncryptedYjsProvider | null>(null);

  // Stable random color per hook instance
  const [userColor] = useState(
    () =>
      COLLABORATION_CONFIG.USER_COLORS[
        Math.floor(Math.random() * COLLABORATION_CONFIG.USER_COLORS.length)
      ],
  );

  useEffect(() => {
    if (!shouldCollaborate || !noteId || !spaceId || !ydoc || !awareness) {
      // Reset provider when collaboration is not needed
      setProvider(null);
      return;
    }

    // Create encrypted provider
    const prov = new EncryptedYjsProvider({
      doc: ydoc,
      awareness,
      noteId,
      spaceId,
      onConnectionStateChange: setConnectionState,
      onUsersChanged: setRoomUsers,
    });

    // Set provider state so the UI knows we are connected
    setProvider(prov);

    logService.info(
      `Collaboration started for note ${noteId} in space ${spaceId}`,
    );

    return () => {
      prov.destroy();
      setProvider(null);
      setConnectionState("disconnected");
      setRoomUsers([]);
      logService.info(`Collaboration ended for note ${noteId}`);
    };
  }, [noteId, spaceId, shouldCollaborate, ydoc, awareness]);

  return {
    ydoc,
    awareness,
    provider,
    connectionState,
    roomUsers,
    isCollaborating: shouldCollaborate && connectionState === "connected",
    userColor,
  };
}
