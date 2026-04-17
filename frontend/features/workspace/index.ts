// Public API for the Workspace feature
export { useDocuments } from "./hooks/useDocuments";
export { useCreateDocument } from "./hooks/useCreateDocument";
export { useSyncQueue } from "./hooks/useSyncQueue";
export { documentService } from "./services/document.service";
export type {
  Document,
  SyncStatus,
  SyncEvent,
  SyncEventType,
} from "./types/workspace.types";
