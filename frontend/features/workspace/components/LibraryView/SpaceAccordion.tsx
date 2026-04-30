import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NoteList } from "./NoteList";
import type { Space } from "@/features/spaces/types/spaces.types";
import type { Note } from "@/features/workspace/types/workspace.types";

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
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Set default expanded spaces (all by default)
  const defaultValue = spaces.map((s) => s.id);

  return (
    <Accordion type="multiple" defaultValue={defaultValue} className="w-full space-y-4">
      {spaces.map((space) => {
        const notes = spaceNotesMap[space.id] || [];
        
        return (
          <AccordionItem
            key={space.id}
            value={space.id}
            className="border bg-card text-card-foreground rounded-xl px-4 shadow-sm"
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
