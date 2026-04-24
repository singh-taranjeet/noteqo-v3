/**
 * ai.worker.ts
 *
 * This Web Worker handles all AI model loading and text inference.
 * It runs entirely off the main thread to keep the UI responsive.
 * All processing is local — no network requests are made during inference.
 */

import type { TextGenerationPipeline } from "@huggingface/transformers";
import { pipeline, type ProgressInfo } from "@huggingface/transformers";
import type {
  AiWorkerMessage,
  AiWorkerResponse,
} from "@/features/ai/types/ai.types";
import {
  AI_CONFIG,
  AI_SYSTEM_PROMPT,
} from "@/features/ai/constants/ai.constants";
import { logService } from "@/services";

let generator: TextGenerationPipeline | null = null;
let isLoadingModel = false;
let abortController: AbortController | null = null;

function postResponse(response: AiWorkerResponse): void {
  self.postMessage(response);
}

async function loadModel(): Promise<void> {
  if (generator || isLoadingModel) return;

  isLoadingModel = true;
  logService.log("loading model");

  try {
    console.log("AI Model is not loaded yet", generator);
    generator = (await pipeline("text-generation", AI_CONFIG.MODEL_ID, {
      progress_callback: (progress: ProgressInfo) => {
        if ("progress" in progress && typeof progress.progress === "number") {
          const percentage = Math.round(progress.progress * 100);
          const file = "file" in progress ? String(progress.file ?? "") : "";
          postResponse({
            type: "PROGRESS",
            payload: {
              progress: percentage,
              progressLabel: file
                ? `Downloading model... ${percentage}%`
                : `Preparing model... ${percentage}%`,
            },
          });
          
        }
      },
    })) as TextGenerationPipeline;

    
    postResponse({ type: "MODEL_READY" });
    console.log("[AI] Model loaded and ready for inference.");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error loading model";
    postResponse({ type: "ERROR", payload: { error: message } });
  } finally {
    isLoadingModel = false;
  }
}

async function runInference(prompt: string): Promise<void> {
  if (!generator) {
    await loadModel();
    if (!generator) {
      postResponse({
        type: "ERROR",
        payload: { error: "Model failed to load." },
      });
      return;
    }
  }

  abortController = new AbortController();

  try {
    const messages = [
      { role: "system", content: AI_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ];

    const output = await generator(messages, {
      max_new_tokens: AI_CONFIG.MAX_NEW_TOKENS,
      do_sample: false,
    });

    let resultText = "";

    // Extract the generated (assistant) portion from the output
    if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (first && typeof first === "object" && "generated_text" in first) {
        const generated = first.generated_text;
        if (Array.isArray(generated)) {
          // Chat format: array of messages — take the last assistant message
          const lastMsg = generated[generated.length - 1];
          if (lastMsg && typeof lastMsg === "object" && "content" in lastMsg) {
            resultText = String(lastMsg.content ?? "");
          }
        } else if (typeof generated === "string") {
          resultText = generated;
        }
      }
    }

    // Emit tokens for streaming preview
    const words = resultText.split(" ");
    for (const word of words) {
      if (abortController?.signal.aborted) break;
      postResponse({ type: "TOKEN", payload: { token: word + " " } });
    }

    postResponse({ type: "DONE", payload: { result: resultText } });
  } catch (error: unknown) {
    if (abortController?.signal.aborted) {
      postResponse({ type: "DONE", payload: { result: "" } });
      return;
    }
    const message = error instanceof Error ? error.message : "Inference failed";
    postResponse({ type: "ERROR", payload: { error: message } });
  } finally {
    abortController = null;
  }
}

self.onmessage = async (event: MessageEvent<AiWorkerMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case "LOAD_MODEL":
      await loadModel();
      break;
    case "GENERATE":
      if (payload?.prompt) {
        await runInference(payload.prompt);
      }
      break;
    case "ABORT":
      abortController?.abort();
      break;
    default:
      break;
  }
};
