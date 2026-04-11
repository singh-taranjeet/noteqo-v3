// Public API for the ai feature
export { AiMenu } from "./components/AiMenu/AiMenu";
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
  AccordionItem,
} from "./types/ai.types";
