// Components
export { SpaceHomeView } from "./components/SpaceHomeView/SpaceHomeView";
export { SpaceSettingsDialog } from "./components/SpaceSettingsDialog/SpaceSettingsDialog";

// Constants
export {
  SPACE_TYPE,
  SPACES_EVENTS,
  SPACE_DEFAULTS,
  SPACES_API_ROUTES,
  SYNC_API_ROUTES,
  SPACES_MESSAGES,
  NOTE_FALLBACKS,
} from "./constants/spaces.constants";

// Context
export {
  ActiveSpaceProvider,
  useActiveSpace,
} from "./context/ActiveSpaceContext";

// Hooks
export { useSpaces } from "./hooks/useSpaces";
export { useCreateSpace } from "./hooks/useCreateSpace";
export { useRemoteSpaces } from "./hooks/useRemoteSpace";
export {
  useSpaceMembers,
  useAddSpaceMember,
  useRemoveSpaceMember,
} from "./hooks/useSpaceMembers";

// Services
export { spaceService } from "./services/space.service";
export { spaceApiService } from "./services/space-api.service";
export { SpaceLocalService } from "./services/space-local.service";
export { SpaceLocalStorageService } from "./services/space-local-storage.service";
export { spaceSyncQueueService } from "./services/space-sync-queue.service";

// Types
export type {
  Space,
  SpaceType,
  RemoteSpace,
  SpaceNotesResponse,
  RemoteSpaceNote,
} from "./types/spaces.types";
