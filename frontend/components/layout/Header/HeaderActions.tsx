"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
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
import { useLocalNotes } from "@/features/workspace/hooks/useLocalNotes";
import { MOCK_USER } from "@/features/auth";

export function HeaderActions() {
  const params = useParams();
  const noteId = params?.note_id as string | undefined;

  const { data: notes } = useLocalNotes();

  const currentNote = useMemo(() => {
    if (!notes || !noteId) return null;
    return notes.find((n) => n.id === noteId);
  }, [notes, noteId]);

  const formattedDate = useMemo(() => {
    if (!currentNote?.updatedAt) return "";
    return format(new Date(currentNote.updatedAt), "MMM d");
  }, [currentNote?.updatedAt]);

  const userInitials = useMemo(() => {
    return MOCK_USER.NAME.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, []);

  return (
    <div className="flex items-center gap-1 shrink-0">
      {/* Last edited timestamp */}
      {formattedDate && (
        <span className="hidden sm:inline text-xs text-muted-foreground mr-2 whitespace-nowrap">
          Edited {formattedDate}
        </span>
      )}

      {/* User avatar */}
      {currentNote && (
        <Avatar className="h-6 w-6 text-xs">
          <AvatarFallback className="bg-primary/10 text-foreground text-xs font-medium">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      )}

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
