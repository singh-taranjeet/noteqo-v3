import { Eye, RefreshCw, Trash2 } from "lucide-react";

import { useSpaces } from "@/features/spaces";
import { useRestoreNote } from "../../hooks/useRestoreNote";
import { usePermanentDeleteNote } from "../../hooks/usePermanentDeleteNote";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Note } from "../../types/workspace.types";
import { useMemo, useState } from "react";
import { PreviewNoteDialog } from "./PreviewNoteDialog";
import { ContainerLayout } from "@/layouts/ContainerLayout";
import { NoteTable, type TableNote } from "./../NoteTable";

function TrashRowActions({ note, isRoot, onPreview }: { note: TableNote, isRoot: boolean, onPreview: () => void }) {
  const restoreMutation = useRestoreNote();
  const permanentDeleteMutation = usePermanentDeleteNote();

  const isRestoring =
    restoreMutation.isPending && restoreMutation.variables === note.id;
  const isDeleting =
    permanentDeleteMutation.isPending &&
    permanentDeleteMutation.variables === note.id;

  return (
    <div className="flex items-center justify-end gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        className="hidden sm:flex h-8"
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
            onClick={(e) => {
              e.stopPropagation();
              restoreMutation.mutate(note.id);
            }}
            className="h-8"
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
            onClick={(e) => {
              e.stopPropagation();
              permanentDeleteMutation.mutate(note.id);
            }}
            className="h-8"
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
  );
}

export function TrashView() {
  const { trashedNotes, isLoading, data: spacesData } = useSpaces();
  const [previewNote, setPreviewNote] = useState<Note | null>(null);

  const treeRoots = useMemo(() => {
    if (!trashedNotes)
      return [];

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

    const buildTree = (note: Note): TableNote => {
      const kids = children.get(note.id) || [];
      return {
        ...note,
        children: kids.map(buildTree),
      };
    };

    return roots.map(buildTree);
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
    <ContainerLayout.Spacer>
      <ContainerLayout.Heading title="Trash" Icon={Trash2} subTitle="Restore deleted notes or permanently remove them." />


      <div className="flex-1 overflow-y-auto pb-12">
        <NoteTable
          notes={treeRoots}
          spaces={spacesData?.spaces || []}
          hideCreatedBy={true}
          dateColumnLabel="Deleted Date"
          getDateValue={(note) => note.deletedAt || note.updatedAt}
          onRowClick={(note) => {
            const trashed = trashedNotes?.find(n => n.id === note.id);
            if (trashed) setPreviewNote(trashed);
          }}
          renderActions={(note, isRoot) => (
            <TrashRowActions 
              note={note} 
              isRoot={isRoot} 
              onPreview={() => {
                const trashed = trashedNotes?.find(n => n.id === note.id);
                if (trashed) setPreviewNote(trashed);
              }} 
            />
          )}
          emptyMessage="Your trash is empty."
        />
      </div>
      {previewNote ? (
        <PreviewNoteDialog
          noteId={previewNote?.id}
          isOpen={!!previewNote?.id}
          onClose={() => setPreviewNote(null)}
        />
      ) : null}

    </ContainerLayout.Spacer>
  );
}
