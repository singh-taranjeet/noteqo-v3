// Public API for the Workspace feature
export { LibraryView } from "./components/LibraryView/LibraryView";
export { DashboardView } from "./components/DashboardView/DashboardView";
export { TrashView } from "./components/TrashView/TrashView";
export { useLocalNotes } from "./hooks/useLocalNotes";
export { useSidebarSearchNotes } from "./hooks/useSidebarSearchNotes";
export { useRecentNotes } from "./hooks/useRecentNotes";
export { useCreateNote } from "./hooks/useCreateNote";
export { useDuplicateNote } from "./hooks/useDuplicateNote";
export { useToggleFavoriteNote } from "./hooks/useToggleFavoriteNote";
export { useSyncQueue } from "./hooks/useSyncQueue";
export { useDeleteNote } from "./hooks/useDeleteNote";
export { useRestoreNote } from "./hooks/useRestoreNote";
export { usePermanentDeleteNote } from "./hooks/usePermanentDeleteNote";
export { noteService } from "./services/note.service";
export { versionHistoryService } from "./services/version-history.service";
export type {
  Note,
  NoteType,
  SyncStatus,
  SyncEvent,
  SyncEventType,
  RemoteNoteVersion,
  DecryptedNoteVersion,
} from "./types/workspace.types";
export type {
  SidebarSearchResultItem,
  SidebarSearchFilters,
  SidebarSearchSection,
} from "./types/sidebar-search.types";
