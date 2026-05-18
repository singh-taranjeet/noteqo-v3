import { useEffect, useState } from "react";
import * as Y from "yjs";
import { EncryptedYjsProvider } from "@/features/realtime/providers/EncryptedYjsProvider";
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
  /** The Yjs provider (for awareness/cursor support) */
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
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<EncryptedYjsProvider | null>(null);

  // Stable random color per hook instance
  const [userColor] = useState(
    () =>
      COLLABORATION_CONFIG.USER_COLORS[
        Math.floor(Math.random() * COLLABORATION_CONFIG.USER_COLORS.length)
      ],
  );

  const shouldCollaborate = !isReadOnly && !!spaceId;

  useEffect(() => {
    if (!shouldCollaborate || !noteId || !spaceId) {
      // Reset state when collaboration is not needed
      setYdoc(null);
      setProvider(null);
      return;
    }

    // Create Yjs document
    const doc = new Y.Doc();

    // Create encrypted provider
    const prov = new EncryptedYjsProvider({
      doc,
      noteId,
      spaceId,
      onConnectionStateChange: setConnectionState,
      onUsersChanged: setRoomUsers,
    });

    // Set state — triggers a re-render so the parent gets the instances
    setYdoc(doc);
    setProvider(prov);

    logService.info(
      `Collaboration started for note ${noteId} in space ${spaceId}`,
    );

    return () => {
      prov.destroy();
      doc.destroy();
      setYdoc(null);
      setProvider(null);
      setConnectionState("disconnected");
      setRoomUsers([]);
      logService.info(`Collaboration ended for note ${noteId}`);
    };
  }, [noteId, spaceId, shouldCollaborate]);

  return {
    ydoc,
    provider,
    connectionState,
    roomUsers,
    isCollaborating: shouldCollaborate && connectionState === "connected",
    userColor,
  };
}
