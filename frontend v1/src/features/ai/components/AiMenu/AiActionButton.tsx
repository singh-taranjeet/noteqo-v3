
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AiActionButtonProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  onClick: () => void;
}

export function AiActionButton({
  label,
  description,
  icon,
  isLoading,
  onClick,
}: Readonly<AiActionButtonProps>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          onClick={onClick}
          className={cn(
            "w-full justify-start gap-2 h-8 px-2 text-sm font-normal",
            "hover:bg-accent hover:text-accent-foreground",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          <span className="shrink-0 text-muted-foreground">{icon}</span>
          <span className="truncate">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-40 text-xs">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}
