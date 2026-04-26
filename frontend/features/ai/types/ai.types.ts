export type AiActionType =
  | "reformat"
  | "spellcheck"
  | "restructure_accordion"
  | "restructure_card"
  | "summarize";

export type AiWorkerStatus =
  | "idle"
  | "loading_model"
  | "ready"
  | "inferring"
  | "error";

export interface AiWorkerMessage {
  type: "LOAD_MODEL" | "GENERATE" | "ABORT";
  payload?: { prompt: string; actionType: AiActionType };
}

export interface AiWorkerResponsePayload {
  token?: string;
  result?: string;
  progress?: number;
  progressLabel?: string;
  error?: string;
}

export interface AiWorkerResponse {
  type: "PROGRESS" | "TOKEN" | "DONE" | "ERROR" | "MODEL_READY";
  payload?: AiWorkerResponsePayload;
}

export interface AiMenuState {
  isOpen: boolean;
  selectedText: string;
  selectionFrom: number;
  selectionTo: number;
}

export interface AccordionItem {
  title: string;
  content: string;
}
