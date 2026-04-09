// Public API for the Workspace feature
export { useLocalNotes } from "./hooks/useLocalNotes";
export { useSidebarSearchNotes } from "./hooks/useSidebarSearchNotes";
export { useRemoteNotes } from "./hooks/useRemoteNotes";
export { useCreateNote } from "./hooks/useCreateNote";
export { useSyncQueue } from "./hooks/useSyncQueue";
export { noteService } from "./services/note.service";
export type {
  Note,
  NoteType,
  SyncStatus,
  SyncEvent,
  SyncEventType,
} from "./types/workspace.types";
export type {
  SidebarSearchResultItem,
  SidebarSearchFilters,
  SidebarSearchSection,
} from "./types/sidebar-search.types";
