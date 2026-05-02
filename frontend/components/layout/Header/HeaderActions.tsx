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
import { Spinner } from "@/components/ui/spinner";
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
import { useLocalNotes } from "@/features/workspace/hooks/useLocalNotes";
import { useDuplicateNote } from "@/features/workspace/hooks/useDuplicateNote";
import { useToggleFavoriteNote } from "@/features/workspace/hooks/useToggleFavoriteNote";
import { MOCK_USER, useUserProfile } from "@/features/auth";
import { VersionHistoryDialog } from "@/features/editor";

export function HeaderActions() {
  const params = useParams();
  const noteId = params?.note_id as string | undefined;

  const { data: notes } = useLocalNotes();
  const duplicateMutation = useDuplicateNote();
  const isDuplicating = duplicateMutation.isPending;

  const toggleFavoriteMutation = useToggleFavoriteNote();

  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  const { data: userProfile } = useUserProfile();

  const currentNote = useMemo(() => {
    if (!notes || !noteId) return null;
    return notes.find((n) => n.id === noteId);
  }, [notes, noteId]);

  const formattedDate = useMemo(() => {
    if (!currentNote?.updatedAt) return "";
    return format(new Date(currentNote.updatedAt), "MMM d");
  }, [currentNote]);

  const avatarEmoji = userProfile?.name
    ? userProfile.name.charAt(0).toUpperCase()
    : MOCK_USER.AVATAR;

  const username = userProfile?.name || MOCK_USER.NAME;

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
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center h-6 w-6 bg-sidebar-accent rounded-md shrink-0 cursor-default mr-1">
              <span
                className="text-sm shrink-0 leading-none"
                role="img"
                aria-label="User avatar"
              >
                {avatarEmoji}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Last edited by {username}
          </TooltipContent>
        </Tooltip>
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
      {noteId && currentNote && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${currentNote.isFavorite ? "text-yellow-500 hover:text-yellow-600" : ""}`}
              aria-label={
                currentNote.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              onClick={() =>
                toggleFavoriteMutation.mutate({
                  noteId,
                  isFavorite: !currentNote.isFavorite,
                })
              }
              disabled={toggleFavoriteMutation.isPending}
            >
              <HugeiconsIcon icon={FavouriteIcon} size={16} strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {currentNote.isFavorite
              ? "Remove from favorites"
              : "Add to favorites"}
          </TooltipContent>
        </Tooltip>
      )}

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
                <Spinner className="size-4" />
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
