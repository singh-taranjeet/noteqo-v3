"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FavouriteIcon,
  MoreHorizontalIcon,
  Clock04Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocalNotes } from "@/features/workspace/hooks/useLocalNotes";
import { useDuplicateNote } from "@/features/workspace/hooks/useDuplicateNote";
import { MOCK_USER } from "@/features/auth";
import { VersionHistoryDialog } from "@/features/editor";

export function HeaderActions() {
  const params = useParams();
  const noteId = params?.note_id as string | undefined;

  const { data: notes } = useLocalNotes();
  const duplicateMutation = useDuplicateNote();
  const isDuplicating = duplicateMutation.isPending;

  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const currentNote = useMemo(() => {
    if (!notes || !noteId) return null;
    return notes.find((n) => n.id === noteId);
  }, [notes, noteId]);

  const formattedDate = useMemo(() => {
    if (!currentNote?.updatedAt) return "";
    return format(new Date(currentNote.updatedAt), "MMM d");
  }, [currentNote]);

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

      {/* Version history */}
      {noteId && currentNote && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Version history"
              onClick={() => setIsVersionHistoryOpen(true)}
              id="version-history-button"
            >
              <HugeiconsIcon icon={Clock04Icon} size={16} strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Version history</TooltipContent>
        </Tooltip>
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

      {/* More options dropdown */}
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="More options"
                id="more-options-button"
              >
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  size={16}
                  strokeWidth={1.5}
                />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">More options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {noteId && currentNote && (
            <DropdownMenuItem
              id="duplicate-page-button"
              disabled={isDuplicating}
              onClick={() => duplicateMutation.mutate({ noteId })}
            >
              {isDuplicating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={1.5} />
              )}
              Duplicate page
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Version history dialog */}
      {noteId && currentNote?.spaceId && (
        <VersionHistoryDialog
          noteId={noteId}
          spaceId={currentNote.spaceId}
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
        />
      )}
    </div>
  );
}
