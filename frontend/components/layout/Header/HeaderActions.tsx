"use client";
import { Clock, Copy, MoreHorizontal, Plus, Star, Trash2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useLocalNotes } from "@/features/workspace/hooks/useLocalNotes";
import { useDuplicateNote } from "@/features/workspace/hooks/useDuplicateNote";
import { useToggleFavoriteNote } from "@/features/workspace/hooks/useToggleFavoriteNote";
import { useCreateNote } from "@/features/workspace/hooks/useCreateNote";
import { useDeleteNote } from "@/features/workspace/hooks/useDeleteNote";
import { MOCK_USER, useUserProfile } from "@/features/auth";
import { VersionHistoryDialog } from "@/features/editor";

export function HeaderActions() {
  const params = useParams();
  const noteId = params?.note_id as string | undefined;

  const { data: notes } = useLocalNotes();
  const duplicateMutation = useDuplicateNote();
  const isDuplicating = duplicateMutation.isPending;

  const toggleFavoriteMutation = useToggleFavoriteNote();
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote();
  const router = useRouter();

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
            <div className="hidden sm:flex items-center justify-center h-6 w-6 bg-sidebar-accent rounded-md shrink-0 cursor-default mr-1">
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
        <TooltipIconButton
          icon={Clock}
          tooltip="Version history"
          className="hidden sm:flex h-7 w-7"
          onClick={() => setIsVersionHistoryOpen(true)}
          id="version-history-button"
        />
      )}

      {/* Add child note */}
      {noteId && currentNote && (
        <TooltipIconButton
          icon={Plus}
          tooltip="Add child note"
          className="hidden sm:flex h-7 w-7"
          onClick={() =>
            createNoteMutation.mutate({
              spaceId: currentNote.spaceId,
              parentId: currentNote.id,
            })
          }
          disabled={createNoteMutation.isPending}
          id="add-child-note-button"
        />
      )}

      {/* Favorite toggle */}
      {noteId && currentNote && (
        <TooltipIconButton
          icon={Star}
          tooltip={
            currentNote.isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          className={`hidden sm:flex h-7 w-7 ${currentNote.isFavorite ? "text-yellow-500 hover:text-yellow-600" : ""}`}
          onClick={() =>
            toggleFavoriteMutation.mutate({
              noteId,
              isFavorite: !currentNote.isFavorite,
            })
          }
          disabled={toggleFavoriteMutation.isPending}
        />
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
                <MoreHorizontal size={16} strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">More options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <div className="sm:hidden">
            {currentNote && formattedDate && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 bg-sidebar-accent rounded-md shrink-0 cursor-default">
                  <span
                    className="text-sm shrink-0 leading-none"
                    role="img"
                    aria-label="User avatar"
                  >
                    {avatarEmoji}
                  </span>
                </div>
                <span>
                  Edited by {username}
                  <br />
                  {formattedDate}
                </span>
              </div>
            )}
            {noteId && currentNote && (
              <DropdownMenuItem
                onClick={() =>
                  toggleFavoriteMutation.mutate({
                    noteId,
                    isFavorite: !currentNote.isFavorite,
                  })
                }
                disabled={toggleFavoriteMutation.isPending}
              >
                <Star
                  size={16}
                  strokeWidth={1.5}
                  className={currentNote.isFavorite ? "text-yellow-500" : ""}
                />
                {currentNote.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"}
              </DropdownMenuItem>
            )}
            {noteId && currentNote && (
              <DropdownMenuItem onClick={() => setIsVersionHistoryOpen(true)}>
                <Clock size={16} strokeWidth={1.5} />
                Version history
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </div>

          {noteId && currentNote && (
            <>
              <DropdownMenuItem
                id="duplicate-page-button"
                disabled={isDuplicating}
                onClick={() => duplicateMutation.mutate({ noteId })}
              >
                {isDuplicating ? (
                  <Spinner className="size-4" />
                ) : (
                  <Copy size={16} strokeWidth={1.5} />
                )}
                Duplicate page
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={deleteNoteMutation.isPending}
                onClick={() => {
                  deleteNoteMutation.mutate(noteId, {
                    onSuccess: () => {
                      router.push(ROUTES.NOTES);
                    },
                  });
                }}
              >
                {deleteNoteMutation.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <Trash2 size={16} strokeWidth={1.5} />
                )}
                Delete
              </DropdownMenuItem>
            </>
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
