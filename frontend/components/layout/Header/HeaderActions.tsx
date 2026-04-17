import { HugeiconsIcon } from "@hugeicons/react";
import {
  Share01Icon,
  FavouriteIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {/* Last edited timestamp */}
      <span className="hidden sm:inline text-xs text-muted-foreground mr-2 whitespace-nowrap">
        Edited Apr 11
      </span>

      {/* User avatar */}
      <Avatar className="h-6 w-6 text-xs">
        <AvatarFallback className="bg-primary/10 text-foreground text-xs font-medium">
          TS
        </AvatarFallback>
      </Avatar>

      {/* Share button */}
      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs px-2">
        <HugeiconsIcon icon={Share01Icon} size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {/* Favorite toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="Add to favorites"
          >
            <HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.5} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Add to favorites</TooltipContent>
      </Tooltip>

      {/* More options */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label="More options"
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={16}
              strokeWidth={1.5}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">More options</TooltipContent>
      </Tooltip>
    </div>
  );
}
