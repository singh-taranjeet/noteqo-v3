import { useEffect, useRef, useState, useCallback } from "react";
import type {
  AiActionType,
  AiWorkerMessage,
  AiWorkerResponse,
  AiWorkerStatus,
} from "@/features/ai/types/ai.types";

interface UseAiWorkerReturn {
  status: AiWorkerStatus;
  downloadProgress: number;
  downloadProgressLabel: string;
  generate: (
    prompt: string,
    actionType: AiActionType,
    onToken: (token: string) => void,
  ) => Promise<string>;
  abort: () => void;
}

export function useAiWorker(): UseAiWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<AiWorkerStatus>("idle");
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadProgressLabel, setDownloadProgressLabel] =
    useState<string>("");

  // Pending promise resolvers for the current generation
  const resolveRef = useRef<((result: string) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);
  const onTokenRef = useRef<((token: string) => void) | null>(null);

  const getWorker = useCallback((): Worker => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL("../services/ai.worker.ts", import.meta.url),
        { type: "module" },
      );

      workerRef.current.onmessage = (event: MessageEvent<AiWorkerResponse>) => {
        const { type, payload } = event.data;

        switch (type) {
          case "PROGRESS":
            setStatus("loading_model");
            setDownloadProgress(payload?.progress ?? 0);
            setDownloadProgressLabel(
              payload?.progressLabel ?? "Loading model...",
            );
            break;

          case "MODEL_READY":
            setStatus("ready");
            setDownloadProgress(100);
            setDownloadProgressLabel("Model ready");
            break;

          case "TOKEN":
            if (payload?.token) {
              onTokenRef.current?.(payload.token);
            }
            break;

          case "DONE":
            setStatus("ready");
            resolveRef.current?.(payload?.result ?? "");
            resolveRef.current = null;
            rejectRef.current = null;
            onTokenRef.current = null;
            break;

          case "ERROR":
            setStatus("error");
            rejectRef.current?.(
              new Error(payload?.error ?? "AI generation failed"),
            );
            resolveRef.current = null;
            rejectRef.current = null;
            onTokenRef.current = null;
            break;

          default:
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        setStatus("error");
        rejectRef.current?.(new Error(error.message));
        resolveRef.current = null;
        rejectRef.current = null;
      };
    }
    return workerRef.current;
  }, []);

  const generate = useCallback(
    (
      prompt: string,
      actionType: AiActionType,
      onToken: (token: string) => void,
    ): Promise<string> => {
      const worker = getWorker();
      setStatus("inferring");

      return new Promise<string>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
        onTokenRef.current = onToken;

        const message: AiWorkerMessage = {
          type: "GENERATE",
          payload: { prompt, actionType },
        };
        worker.postMessage(message);
      });
    },
    [getWorker],
  );

  const abort = useCallback(() => {
    if (workerRef.current) {
      const message: AiWorkerMessage = { type: "ABORT" };
      workerRef.current.postMessage(message);
    }
    resolveRef.current?.("");
    resolveRef.current = null;
    rejectRef.current = null;
    onTokenRef.current = null;
    setStatus("ready");
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    status,
    downloadProgress,
    downloadProgressLabel,
    generate,
    abort,
  };
}
