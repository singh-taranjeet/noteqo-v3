import type { AiActionType } from "@/features/ai/types/ai.types";

export const AI_CONFIG = {
  MODEL_ID: "onnx-community/Llama-3.2-1B-Instruct",
  MAX_NEW_TOKENS: 512,
  WORKER_TIMEOUT_MS: 60_000,
  MODEL_DOWNLOAD_SIZE_LABEL: "~800MB",
} as const;

export const AI_ACTION_LABELS: Record<
  AiActionType,
  { label: string; description: string }
> = {
  reformat: {
    label: "Reformat",
    description: "Clean up and improve structure",
  },
  spellcheck: {
    label: "Fix Spelling & Grammar",
    description: "Correct errors in the text",
  },
  summarize: {
    label: "Summarize",
    description: "Condense into bullet points",
  },
  restructure_accordion: {
    label: "Convert to Accordion",
    description: "Turn sections into collapsible panels",
  },
  restructure_card: {
    label: "Wrap in Card",
    description: "Place content inside a card block",
  },
};

export const AI_PROMPTS: Record<AiActionType, string> = {
  reformat: `You are a text editor assistant. Your task is to reformat the following text to be cleaner and better structured. Return ONLY the improved text with no explanation, preamble, or surrounding quotes:\n\n`,
  spellcheck: `You are a proofreader. Fix all spelling and grammar errors in the following text. Return ONLY the corrected text with no explanation or starting sentence like \"Here is the corrected text:\" or anything similar :\n\n`,
  summarize: `You are a summarizer. Summarize the following into 2-3 concise bullet points using the "• " prefix for each point. Return ONLY the bullet points:\n\n`,
  restructure_accordion: `You are a JSON formatter. Convert the following text into an accordion structure. Return ONLY a valid JSON array with no explanation, no markdown code fences, and no surrounding text: [{"title": "string", "content": "string"}]\n\nText:\n`,
  restructure_card: `You are a text editor. Extract the key information from the following text into a clean, concise format suitable for a card. Return ONLY the card content text:\n\n`,
};

export const AI_SYSTEM_PROMPT =
  "You are a helpful writing assistant embedded in a note-taking application. Follow instructions precisely and return only what is asked for.";
