"use client";

import { useState, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import type { AiActionType, AccordionItem } from "@/features/ai/types/ai.types";
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

  const applyAccordionResult = useCallback(
    (result: string, from: number, to: number) => {
      if (!editor) return;

      let items: AccordionItem[] = [];
      try {
        // Strip any markdown fences the model may have added
        const cleaned = result
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const parsed: unknown = JSON.parse(cleaned);
        if (Array.isArray(parsed)) {
          items = (parsed as AccordionItem[]).filter(
            (item) =>
              typeof item === "object" &&
              typeof item.title === "string" &&
              typeof item.content === "string",
          );
        }
      } catch {
        // Fallback: insert result as plain text in an accordion
        items = [{ title: "Summary", content: result }];
      }

      if (items.length === 0) {
        items = [{ title: "Content", content: result }];
      }

      const accordionNodes = items.map((item) => ({
        type: "shadcnAccordion",
        attrs: { title: item.title, isOpen: true },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: item.content }],
          },
        ],
      }));

      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, accordionNodes)
        .run();
    },
    [editor],
  );

  const applyCardResult = useCallback(
    (result: string, from: number, to: number) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, {
          type: "shadcnCard",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: result }],
            },
          ],
        })
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
        // console.log("AI is working", prompt);
        const result = await generate(prompt, actionType, (token) => {
          streamingPreviewRef.current += token;
          setStreamingPreview(streamingPreviewRef.current);
        });

        // console.log("Got result", result);

        const finalText = result.trim() || streamingPreviewRef.current.trim();

        if (!finalText) {
          setError("The AI returned an empty response. Please try again.");
          return;
        }

        switch (actionType) {
          case "reformat":
          case "spellcheck":
          case "summarize":
            applyTextResult(finalText, selectionFrom, selectionTo);
            break;
          case "restructure_accordion":
            applyAccordionResult(finalText, selectionFrom, selectionTo);
            break;
          case "restructure_card":
            applyCardResult(finalText, selectionFrom, selectionTo);
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
      applyAccordionResult,
      applyCardResult,
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
