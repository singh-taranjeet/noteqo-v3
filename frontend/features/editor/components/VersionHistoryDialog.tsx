"use client";

import { useMemo, useState } from "react";

import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVersionHistory } from "../hooks/useVersionHistory";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NoteEditor } from "./NoteEditor";
import type { DecryptedNoteVersion, Note } from "@/features/workspace";

const VERSION_DATE_FORMAT = "MMM d · h:mm a" as const;
const AUTHOR_FALLBACK = "You" as const;

interface VersionHistoryDialogProps {
  noteId: string;
  spaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Notion-style version history dialog with split pane layout:
 * - Left: read-only NoteEditor preview of selected version
 * - Right: scrollable list of all versions
 */
export function VersionHistoryDialog({
  noteId,
  spaceId,
  isOpen,
  onClose,
}: Readonly<VersionHistoryDialogProps>) {
  const {
    versions,
    isLoading,
    error,
    selectedVersion,
    selectVersion,
    restoreVersion,
    isRestoring,
  } = useVersionHistory({ noteId, spaceId, isOpen });

  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"list" | "preview">("list");

  const handleRestore = async () => {
    try {
      await restoreVersion();
      toast.success("Version restored successfully");
      onClose();
    } catch {
      toast.error("Failed to restore version");
    }
  };

  /**
   * Build a read-only Note object from the selected version
   * so the NoteEditor can render it with full fidelity.
   * Memoised to keep a stable reference when the selection hasn't changed.
   */
  const previewNote: Note | undefined = useMemo(() => {
    if (!selectedVersion) return undefined;
    return {
      id: selectedVersion.noteId,
      title: selectedVersion.title,
      emoji: selectedVersion.emoji,
      coverImage: selectedVersion.coverImage,
      content: selectedVersion.content,
      syncStatus: "synced" as const,
      spaceId,
      type: "private" as const,
      createdAt: selectedVersion.createdAt,
      updatedAt: selectedVersion.updatedAt,
    };
  }, [selectedVersion, spaceId]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setTimeout(() => setMobileView("list"), 200);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[92vw] sm:h-[88vh] w-full h-[100dvh] max-w-none rounded-none sm:rounded-4xl p-0 gap-0 overflow-hidden flex flex-col"
        showCloseButton={!isMobile}
      >
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Version history</DialogTitle>

        <div className="flex flex-1 min-h-0">
          {/* ── Left pane: Preview ── */}
          {(!isMobile || mobileView === "preview") && (
            <div className="flex-1 min-w-0 overflow-hidden sm:border-r border-border bg-background flex flex-col">
              {isMobile && selectedVersion && (
                <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between bg-background">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileView("list")}
                    className="-ml-2 text-muted-foreground"
                  >
                    <HugeiconsIcon
                      icon={ArrowLeft02Icon}
                      size={16}
                      className="mr-1"
                    />
                    Back
                  </Button>
                  <div className="text-sm font-semibold truncate px-2">
                    {formatVersionDate(
                      selectedVersion.updatedAt || selectedVersion.createdAt,
                    )}
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white -mr-2"
                  >
                    Restore
                  </Button>
                </div>
              )}
              <div className="flex-1 min-h-0 relative">
                {isLoading ? (
                  <VersionPreviewSkeleton />
                ) : selectedVersion && previewNote ? (
                  <NoteEditor
                    key={selectedVersion.id}
                    noteId={selectedVersion.noteId}
                    note={previewNote}
                    isReadOnly
                    className="h-full"
                    contentWrapperClassName="mb-24"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    {error ? error : "No versions available"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Right pane: Version list ── */}
          {(!isMobile || mobileView === "list") && (
            <div className="sm:w-[280px] w-full shrink-0 flex flex-col min-h-0 bg-background">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
                {isMobile && <div className="w-10" />}
                <h2 className="text-sm font-semibold text-foreground flex-1 text-center sm:text-left">
                  {isMobile ? "History" : "Version history"}
                </h2>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="-mr-2 text-primary font-semibold"
                  >
                    Done
                  </Button>
                )}
              </div>

              {/* Version list */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="py-1">
                  {isLoading ? (
                    <VersionListSkeleton />
                  ) : (
                    versions.map((version) => (
                      <VersionListItem
                        key={version.id}
                        version={version}
                        isSelected={selectedVersion?.id === version.id}
                        onSelect={() => {
                          selectVersion(version);
                          if (isMobile) setMobileView("preview");
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Footer with Restore button (Desktop only) */}
              {!isMobile && (
                <div className="px-4 py-3 border-t border-border shrink-0 flex items-center justify-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRestore}
                    disabled={!selectedVersion || isRestoring}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    id="version-restore-button"
                  >
                    {isRestoring ? "Restoring…" : "Restore"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Sub-components                                            */
/* ────────────────────────────────────────────────────────── */

interface VersionListItemProps {
  version: DecryptedNoteVersion;
  isSelected: boolean;
  onSelect: () => void;
}

function VersionListItem({
  version,
  isSelected,
  onSelect,
}: Readonly<VersionListItemProps>) {
  const dateLabel = formatVersionDate(version.updatedAt || version.createdAt);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left px-4 py-2.5 transition-colors cursor-pointer",
        "hover:bg-accent/50",
        isSelected && "bg-accent",
      )}
      aria-pressed={isSelected}
      id={`version-item-${version.version}`}
    >
      <p
        className={cn(
          "text-sm font-medium leading-tight",
          isSelected ? "text-foreground" : "text-foreground/80",
        )}
      >
        {dateLabel}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{AUTHOR_FALLBACK}</p>
    </button>
  );
}

function VersionPreviewSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* Cover placeholder */}
      <Skeleton className="w-full h-[20vh] rounded-lg" />
      {/* Emoji + title */}
      <div className="space-y-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-10 w-3/4" />
      </div>
      {/* Content lines */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function VersionListSkeleton() {
  return (
    <div className="space-y-1 py-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-4 py-2.5 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

function formatVersionDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), VERSION_DATE_FORMAT);
  } catch {
    return dateStr;
  }
}
