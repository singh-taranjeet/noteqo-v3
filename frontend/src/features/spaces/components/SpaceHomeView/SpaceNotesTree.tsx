import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes.constants";
import type { NoteTreeNode } from "@/features/workspace";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

interface SpaceNotesTreeProps {
  notes: NoteTreeNode[];
  spaceId: string;
}

export function SpaceNotesTree({ notes }: SpaceNotesTreeProps) {
  if (!notes || notes.length === 0) {
    return (
      <Empty className="h-full mt-10">
        <EmptyTitle>No notes found</EmptyTitle>
        <EmptyDescription>
          This space doesn't have any notes yet.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="w-full">
      {notes.map((note) => (
        <NoteTreeNodeItem key={note.id} note={note} depth={0} />
      ))}
    </div>
  );
}

interface NoteTreeNodeItemProps {
  note: NoteTreeNode;
  depth: number;
}

function NoteTreeNodeItem({ note, depth }: NoteTreeNodeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = note.children && note.children.length > 0;

  return (
    <div className="flex flex-col w-full">
      <div
        className={cn(
          "flex items-center gap-1 group rounded-md hover:bg-muted/50 px-2 py-1.5 transition-colors",
        )}
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (hasChildren) setIsExpanded(!isExpanded);
          }}
          className={cn(
            "p-0.5 rounded-sm hover:bg-muted text-muted-foreground shrink-0",
            !hasChildren && "invisible",
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <Link
          to={ROUTES.NOTE(note.id)}
          className="flex flex-1 items-center gap-2 overflow-hidden truncate no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm py-0.5"
        >
          <span className="text-base shrink-0" role="img" aria-hidden="true">
            {note.emoji || (
              <FileText className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {note.title || "Untitled"}
          </span>
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col w-full">
          {note.children.map((child) => (
            <NoteTreeNodeItem key={child.id} note={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
