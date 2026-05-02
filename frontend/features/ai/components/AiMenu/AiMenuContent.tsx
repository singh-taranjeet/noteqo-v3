"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AiSetupPanel } from "./AiSetupPanel";
import { AiLoadingIndicator } from "./AiLoadingIndicator";
import { AiActionButton } from "./AiActionButton";
import type { AiActionType } from "@/features/ai/types/ai.types";
import { AI_ACTION_LABELS } from "@/features/ai/constants/ai.constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignLeftIcon,
  CheckmarkCircle01Icon,
  NoteIcon,
  ArrowDown01Icon,
  LayoutIcon,
} from "@hugeicons/core-free-icons";

const ACTION_ICONS: Record<AiActionType, React.ReactNode> = {
  reformat: <HugeiconsIcon icon={TextAlignLeftIcon} size={14} />,
  spellcheck: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />,
  summarize: <HugeiconsIcon icon={NoteIcon} size={14} />,
  restructure_accordion: <HugeiconsIcon icon={ArrowDown01Icon} size={14} />,
  restructure_card: <HugeiconsIcon icon={LayoutIcon} size={14} />,
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
