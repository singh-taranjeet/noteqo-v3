import { Book, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Note } from "@/features/workspace/types/workspace.types";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";

interface NoteListProps {
  notes: Note[];
  emptyMessage?: string;
}

export function NoteList({
  notes,
  emptyMessage = "No notes found.",
}: NoteListProps) {
  if (!notes.length) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyMedia>
            <Book size={24} />
          </EmptyMedia>
          <EmptyTitle>No notes found</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <Link
          key={note.id}
          to={ROUTES.NOTE(note.id)}
          className={cn(
            "group flex items-center justify-between p-3 rounded-xl border border-transparent",
            "hover:bg-accent/50 hover:border-border transition-all duration-200 !no-underline hover:!no-underline",
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl shrink-0" role="img" aria-hidden="true">
              {note.emoji || "📄"}
            </span>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {note.title || "Untitled"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <Clock size={12} />
            <span>
              {formatDistanceToNow(new Date(note.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
