import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/features/storage";
import type { Note } from "@/features/workspace/types/workspace.types";
import type { Space } from "@/features/spaces/types/spaces.types";
import { NoteLocalService } from "@/features/workspace/services/note-local.service";
import { SpaceLocalService } from "@/features/spaces/services/space-local.service";

/**
 * Live query for all spaces. Auto-re-renders on any Dexie write to the spaces table.
 */
export function useLiveSpaces(): Space[] | undefined {
  return useLiveQuery(() => SpaceLocalService.all(), []);
}

/**
 * Live query for a single space by ID. Auto-re-renders on Dexie write.
 */
export function useLiveSpace(spaceId: string | undefined): Space | undefined {
  return useLiveQuery(
    () => (spaceId ? SpaceLocalService.get(spaceId) : undefined),
    [spaceId],
  );
}

/**
 * Live query for all notes (no filter). Auto-re-renders on any Dexie write to the notes table.
 */
export function useLiveAllNotes(): Note[] | undefined {
  return useLiveQuery(() => NoteLocalService.all(), []);
}

/**
 * Live query for notes in a specific space. Auto-re-renders on Dexie write.
 */
export function useLiveNotesForSpace(
  spaceId: string | undefined,
): Note[] | undefined {
  return useLiveQuery(
    () => (spaceId ? NoteLocalService.ofSpace(spaceId) : []),
    [spaceId],
  );
}

/**
 * Live query for a single note by ID. Auto-re-renders on Dexie write.
 */
export function useLiveNote(noteId: string | undefined): Note | undefined {
  return useLiveQuery(
    () => (noteId ? NoteLocalService.get(noteId) : undefined),
    [noteId],
  );
}

/**
 * Live query for sync queue count. Useful for showing a sync indicator.
 */
export function useLiveSyncQueueCount(): number | undefined {
  return useLiveQuery(() => db.syncQueue.count(), []);
}

/**
 * Live query for pending sync queue count by entity type.
 */
export function useLivePendingSyncCount(
  entity: "note" | "space" | "media",
): number | undefined {
  return useLiveQuery(
    () =>
      db.syncQueue
        .where("entity")
        .equals(entity)
        .filter((e) => e.syncStatus === "pending")
        .count(),
    [entity],
  );
}
