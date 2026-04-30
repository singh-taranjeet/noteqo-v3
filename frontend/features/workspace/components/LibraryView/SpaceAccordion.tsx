import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NoteList } from "./NoteList";
import type { Space } from "@/features/spaces/types/spaces.types";
import type { Note } from "@/features/workspace/types/workspace.types";
import { HugeiconsIcon } from "@hugeicons/react";
import { NotebookIcon } from "@hugeicons/core-free-icons";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";

interface SpaceAccordionProps {
  spaces: Space[];
  spaceNotesMap: Record<string, Note[]>;
  emptyMessage?: string;
}

export function SpaceAccordion({
  spaces,
  spaceNotesMap,
  emptyMessage = "No spaces found.",
}: SpaceAccordionProps) {
  if (!spaces.length) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyMedia>
            <HugeiconsIcon icon={NotebookIcon} size={24} />
          </EmptyMedia>
          <EmptyTitle>No spaces found</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  // Set default expanded spaces (all by default)
  const defaultValue = spaces.map((s) => s.id);

  return (
    <Accordion type="multiple" defaultValue={defaultValue} className="w-full">
      {spaces.map((space) => {
        const notes = spaceNotesMap[space.id] || [];
        
        return (
          <AccordionItem
            key={space.id}
            value={space.id}
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{space.name || "Untitled Space"}</span>
                <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
                  {notes.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <NoteList 
                notes={notes} 
                emptyMessage="This space has no notes yet."
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
