import {
  ChevronDown,
  ChevronRight,
  Eye,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { useSpaces } from "@/features/spaces";
import { useRestoreNote } from "../../hooks/useRestoreNote";
import { usePermanentDeleteNote } from "../../hooks/usePermanentDeleteNote";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Note } from "../../types/workspace.types";
import { useMemo, useState } from "react";
import { PreviewNoteDialog } from "./PreviewNoteDialog";

// Helper component to render a single trash node and its children
function TrashNodeItem({
  note,
  depth,
  childrenMap,
  isRoot,
  onPreviewClick,
}: {
  note: Note;
  depth: number;
  childrenMap: Map<string, Note[]>;
  isRoot: boolean;
  onPreviewClick: (noteId: string) => void;
}) {
  const restoreMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDeleteNote();

  const isRestoring =
    restoreMutation.isPending && restoreMutation.variables === note.id;
  const isDeleting =
    permanentDeleteMutation.isPending &&
    permanentDeleteMutation.variables === note.id;

  const children = childrenMap.get(note.id) || [];
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col">
      <div
        className={`group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-accent/50 transition-colors ${depth === 0 ? "bg-card border-border mb-2" : ""}`}
        style={{ paddingLeft: `${Math.max(0, depth * 24 + 12)}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {children.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted text-muted-foreground shrink-0"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 shrink-0" /> // Spacer for alignment
          )}

          <button
            onClick={() => onPreviewClick(note.id)}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer text-left"
          >
            <div className="flex items-center justify-center h-8 w-8 bg-muted rounded-lg shrink-0">
              <span className="text-lg">{note.emoji}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className=" text-sm truncate group-hover:underline decoration-muted-foreground underline-offset-2">
                {note.title}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                Deleted{" "}
                {note.deletedAt
                  ? format(new Date(note.deletedAt), "MMM d, yyyy")
                  : "Unknown"}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreviewClick(note.id)}
            className="hidden sm:flex"
          >
            <Eye size={14} className="mr-2" />
            Preview
          </Button>

          {isRoot && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={isRestoring || isDeleting}
                onClick={() => restoreMutation.mutate(note.id)}
              >
                {isRestoring ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <RefreshCw size={14} className="mr-2" />
                )}
                Restore
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isRestoring || isDeleting}
                onClick={() => permanentDeleteMutation.mutate(note.id)}
              >
                {isDeleting ? (
                  <Spinner className="size-4 mr-2" />
                ) : (
                  <Trash2 size={14} className="mr-2" />
                )}
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isExpanded && children.length > 0 && (
        <div className="flex flex-col relative before:absolute before:left-8 before:top-0 before:bottom-0 before:w-px before:bg-border">
          {children.map((child) => (
            <TrashNodeItem
              key={child.id}
              note={child}
              depth={depth + 1}
              childrenMap={childrenMap}
              isRoot={false}
              onPreviewClick={onPreviewClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TrashView() {
  const { trashedNotes, isLoading } = useSpaces();
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  const { rootNotes, childrenMap } = useMemo(() => {
    if (!trashedNotes)
      return { rootNotes: [], childrenMap: new Map<string, Note[]>() };

    const trashedIds = new Set(trashedNotes.map((n) => n.id));
    const roots: Note[] = [];
    const children = new Map<string, Note[]>();

    trashedNotes.forEach((note) => {
      // It's a root if it has no parent OR its parent is not in the trashedNotes list
      if (!note.parentId || !trashedIds.has(note.parentId)) {
        roots.push(note);
      } else {
        if (!children.has(note.parentId)) {
          children.set(note.parentId, []);
        }
        children.get(note.parentId)!.push(note);
      }
    });

    // Sort roots by recently deleted
    roots.sort((a, b) => {
      const aDate = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
      const bDate = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
      return bDate - aDate;
    });

    return { rootNotes: roots, childrenMap: children };
  }, [trashedNotes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (!trashedNotes || trashedNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-4 px-4">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
          <Trash2 size={32} className="text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Trash is empty
          </h2>
          <p className="text-sm text-muted-foreground">
            Notes you delete will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto py-8 px-4 sm:px-8">
      <div className="flex flex-col gap-2 mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Trash</h1>
        <p className="text-muted-foreground">
          Restore deleted notes or permanently remove them.
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 pb-8">
          {rootNotes.map((note) => (
            <TrashNodeItem
              key={note.id}
              note={note}
              depth={0}
              childrenMap={childrenMap}
              isRoot={true}
              onPreviewClick={() => setPreviewNote(note)}
            />
          ))}
        </div>
      </ScrollArea>
      {previewNote ? (
        <PreviewNoteDialog
          noteId={previewNote?.id}
          isOpen={!!previewNote?.id}
          onClose={() => setPreviewNote(null)}
        />
      ) : null}
    </div>
  );
}
