"use client";

import { Progress } from "@/components/ui/progress";
import { AI_CONFIG } from "@/features/ai/constants/ai.constants";

interface AiSetupPanelProps {
  progress: number;
  progressLabel: string;
}

export function AiSetupPanel({
  progress,
  progressLabel,
}: Readonly<AiSetupPanelProps>) {
  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          Setting up AI assistant
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Downloading the AI model ({AI_CONFIG.MODEL_DOWNLOAD_SIZE_LABEL}) for
          the first time. This only happens once — it will be cached on your
          device.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Progress value={progress} className="h-1.5" />
        <p className="text-xs text-muted-foreground">{progressLabel}</p>
      </div>

      <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-2">
        <span className="text-xs">🔒</span>
        <p className="text-xs text-muted-foreground">
          Runs entirely on your device. Nothing is sent to any server.
        </p>
      </div>
    </div>
  );
}
