"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AiSetupPanel } from "./AiSetupPanel";
import { AiLoadingIndicator } from "./AiLoadingIndicator";
import { AiActionButton } from "./AiActionButton";
import type { AiActionType } from "@/features/ai/types/ai.types";
import { AI_ACTION_LABELS } from "@/features/ai/constants/ai.constants";

// Inline SVG icons scoped to this component — no extra icon library needed
const ACTION_ICONS: Record<AiActionType, React.ReactNode> = {
  reformat: (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h7"
      />
    </svg>
  ),
  spellcheck: (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  summarize: (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  restructure_accordion: (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  restructure_card: (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9h18"
      />
    </svg>
  ),
};

const PRIMARY_ACTIONS: AiActionType[] = ["reformat", "spellcheck", "summarize"];
const RESTRUCTURE_ACTIONS: AiActionType[] = [
  "restructure_accordion",
  "restructure_card",
];

interface AiMenuContentProps {
  isLoading: boolean;
  downloadProgress: number;
  downloadProgressLabel: string;
  streamingPreview: string;
  error: string | null;
  onActionClick: (actionType: AiActionType) => void;
  onAbort: () => void;
}

export function AiMenuContent({
  isLoading,
  downloadProgress,
  downloadProgressLabel,
  streamingPreview,
  error,
  onActionClick,
  onAbort,
}: Readonly<AiMenuContentProps>) {
  // Model is downloading for the first time
  if (downloadProgress > 0 && downloadProgress < 100 && isLoading) {
    return (
      <AiSetupPanel
        progress={downloadProgress}
        progressLabel={downloadProgressLabel}
      />
    );
  }

  // Inference in progress
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        <AiLoadingIndicator streamingPreview={streamingPreview} />
        <Button
          variant="ghost"
          size="sm"
          onClick={onAbort}
          className="h-7 w-full text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-2 p-1">
        <p className="text-xs text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground">Please try again.</p>
      </div>
    );
  }

  // Normal action list
  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Edit
      </p>
      {PRIMARY_ACTIONS.map((actionType) => {
        const info = AI_ACTION_LABELS[actionType];
        return (
          <AiActionButton
            key={actionType}
            label={info.label}
            description={info.description}
            icon={ACTION_ICONS[actionType]}
            isLoading={isLoading}
            onClick={() => onActionClick(actionType)}
          />
        );
      })}

      <Separator className="my-1" />

      <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Restructure
      </p>
      {RESTRUCTURE_ACTIONS.map((actionType) => {
        const info = AI_ACTION_LABELS[actionType];
        return (
          <AiActionButton
            key={actionType}
            label={info.label}
            description={info.description}
            icon={ACTION_ICONS[actionType]}
            isLoading={isLoading}
            onClick={() => onActionClick(actionType)}
          />
        );
      })}
    </div>
  );
}
