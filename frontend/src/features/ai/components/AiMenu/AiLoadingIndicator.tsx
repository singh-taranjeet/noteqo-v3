import { Spinner } from "@/components/ui/spinner";

interface AiLoadingIndicatorProps {
  streamingPreview?: string;
}

export function AiLoadingIndicator({
  streamingPreview,
}: Readonly<AiLoadingIndicatorProps>) {
  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex items-center gap-2">
        <Spinner className="size-4 text-primary" />
        <span className="text-xs text-muted-foreground">Generating…</span>
      </div>

      {streamingPreview && (
        <p className="text-xs text-foreground/70 max-h-20 overflow-hidden leading-relaxed line-clamp-4 font-mono">
          {streamingPreview}
          <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 animate-pulse align-text-bottom" />
        </p>
      )}
    </div>
  );
}
