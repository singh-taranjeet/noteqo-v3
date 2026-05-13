"use client";

import { useEffect, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { db } from "@/features/storage";
import { useRealtimeConnection } from "@/features/realtime";

/**
 * Wires up the SSE connection for real-time collaboration
 * and listens for conflict detection events to show toasts.
 *
 * Mount once inside WorkspaceLayout (inside AuthGuard).
 */
export function RealtimeProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Get all space IDs from local Dexie
  const spaces = useLiveQuery(() => db.spaces.toArray(), []);

  const spaceIds = useMemo(() => (spaces || []).map((s) => s.id), [spaces]);

  // Open/close the SSE connection based on available spaces
  useRealtimeConnection(spaceIds);

  // Listen for conflict detection events from the sync queue
  useEffect(() => {
    const handleConflict = (e: Event) => {
      const detail = (
        e as CustomEvent<{ noteId: string; conflictCopyId: string }>
      ).detail;
      toast.warning("Conflict detected", {
        description:
          "Another user modified this note while you were offline. Your changes have been saved as a copy.",
        duration: 8_000,
        action: {
          label: "View copy",
          onClick: () => {
            window.location.href = `/note/${detail.conflictCopyId}`;
          },
        },
      });
    };

    globalThis.addEventListener("noteqo:conflict-detected", handleConflict);
    return () => {
      globalThis.removeEventListener(
        "noteqo:conflict-detected",
        handleConflict,
      );
    };
  }, []);

  return <>{children}</>;
}
