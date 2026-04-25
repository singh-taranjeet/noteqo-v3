import type { AiActionType } from "@/features/ai/types/ai.types";

export const AI_CONFIG = {
  MODEL_ID: "onnx-community/Qwen2.5-0.5B-Instruct",
  MAX_NEW_TOKENS: 512,
  WORKER_TIMEOUT_MS: 60_000,
  MODEL_DOWNLOAD_SIZE_LABEL: "~500MB",
} as const;

export const AI_ACTION_LABELS: Record<
  AiActionType,
  { label: string; description: string }
> = {
  spellcheck: {
    label: "Fix Spelling & Grammar",
    description: "Correct errors in the text",
  },
};

export const AI_PROMPTS: Record<AiActionType, string> = {
  spellcheck: `You are a proofreader. Fix all spelling and grammar errors in the following text. Return ONLY the corrected text with no explanation:\n\n`,
};

export const AI_SYSTEM_PROMPT =
  "You are a helpful writing assistant embedded in a note-taking application. Follow instructions precisely and return only what is asked for.";
