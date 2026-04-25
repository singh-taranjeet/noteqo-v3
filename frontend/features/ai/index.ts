// Public API for the ai feature
export { AiMenuPopover } from "./components/AiMenu/AiMenuPopover";
export { AiMenuContent } from "./components/AiMenu/AiMenuContent";
export { AiExtension } from "./extensions/AiExtension";
export { useAiActions } from "./hooks/useAiActions";
export { useAiWorker } from "./hooks/useAiWorker";

export type {
  AiActionType,
  AiWorkerStatus,
  AiWorkerMessage,
  AiWorkerResponse,
  AiMenuState,
} from "./types/ai.types";
