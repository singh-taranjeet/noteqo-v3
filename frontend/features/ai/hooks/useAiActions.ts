"use client";

import { useState, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import type { AiActionType } from "@/features/ai/types/ai.types";
import { AI_PROMPTS } from "@/features/ai/constants/ai.constants";
import { useAiWorker } from "./useAiWorker";

interface UseAiActionsOptions {
  editor: Editor | null;
  selectedText: string;
  selectionFrom: number;
  selectionTo: number;
}

interface UseAiActionsReturn {
  isLoading: boolean;
  streamingPreview: string;
  error: string | null;
  downloadProgress: number;
  downloadProgressLabel: string;
  isModelReady: boolean;
  executeAction: (actionType: AiActionType) => Promise<void>;
  abort: () => void;
}

export function useAiActions({
  editor,
  selectedText,
  selectionFrom,
  selectionTo,
}: Readonly<UseAiActionsOptions>): UseAiActionsReturn {
  const [error, setError] = useState<string | null>(null);
  const streamingPreviewRef = useRef<string>("");
  const [streamingPreview, setStreamingPreview] = useState<string>("");

  const { status, downloadProgress, downloadProgressLabel, generate, abort } =
    useAiWorker();

  const isLoading = status === "loading_model" || status === "inferring";
  const isModelReady = status === "ready";

  const applyTextResult = useCallback(
    (result: string, from: number, to: number) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, result)
        .run();
    },
    [editor],
  );

  const executeAction = useCallback(
    async (actionType: AiActionType): Promise<void> => {
      if (!editor || !selectedText.trim()) return;

      setError(null);
      streamingPreviewRef.current = "";
      setStreamingPreview("");

      const prompt = AI_PROMPTS[actionType] + selectedText;

      try {
        console.log("AI is working", selectedText, prompt);
        const result = await generate(prompt, actionType, (token) => {
          streamingPreviewRef.current += token;
          setStreamingPreview(streamingPreviewRef.current);
        });

        console.log("Got result", result);

        let finalText = result.trim() || streamingPreviewRef.current.trim();

        // Extract content inside markdown code blocks to ignore conversational filler
        const codeBlockMatch = finalText.match(
          /```(?:html|xml|markdown)?\n([\s\S]*?)```/i,
        );
        if (codeBlockMatch && codeBlockMatch[1]) {
          finalText = codeBlockMatch[1].trim();
        } else {
          // Cleanup stray fences if no full block was matched
          finalText = finalText
            .replace(/^```[a-zA-Z]*\n?/, "")
            .replace(/\n?```$/, "")
            .trim();
        }

        if (!finalText) {
          setError("The AI returned an empty response. Please try again.");
          return;
        }

        switch (actionType) {
          case "spellcheck":
            applyTextResult(finalText, selectionFrom, selectionTo);
            break;
        }

        setStreamingPreview("");
        streamingPreviewRef.current = "";
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
      }
    },
    [
      editor,
      selectedText,
      selectionFrom,
      selectionTo,
      generate,
      applyTextResult,
    ],
  );

  const handleAbort = useCallback(() => {
    abort();
    setStreamingPreview("");
    streamingPreviewRef.current = "";
  }, [abort]);

  return {
    isLoading,
    streamingPreview,
    error,
    downloadProgress,
    downloadProgressLabel,
    isModelReady,
    executeAction,
    abort: handleAbort,
  };
}
