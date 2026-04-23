import { SidebarSection } from "./SidebarSection";
import { SidebarSpaceGroup } from "./SidebarSpaceGroup";
import { SidebarPageItem } from "./SidebarPageItem";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Space } from "@/features/spaces/types/spaces.types";
import type { Note } from "@/features/workspace/types/workspace.types";

interface SidebarSpaceCategoryProps {
  label: string;
  spaces: Space[];
  isLoading: boolean;
  emptyMessage: string;
  spaceNotesMap: Record<string, Note[]> | undefined;
  onAddSpaceClick: () => void;
  addSpaceTooltip: string;
  onCreateNote: (spaceId: string) => void;
  onSettingsClick?: (space: Space) => void;
}

export function SidebarSpaceCategory({
  label,
  spaces,
  isLoading,
  emptyMessage,
  spaceNotesMap,
  onAddSpaceClick,
  addSpaceTooltip,
  onCreateNote,
  onSettingsClick,
}: Readonly<SidebarSpaceCategoryProps>) {
  return (
    <SidebarSection
      label={label}
      action={
        <TooltipProvider>
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSpaceClick();
                  }}
                  aria-label={addSpaceTooltip}
                >
                  <HugeiconsIcon
                    icon={Add01Icon}
                    size={14}
                    strokeWidth={2}
                    className="text-muted-foreground"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{addSpaceTooltip}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      }
    >
      {isLoading && (
        <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
          Loading spaces...
        </div>
      )}
      {!isLoading && spaces.length === 0 && (
        <div className="px-5 py-1.5 text-xs text-muted-foreground">
          {emptyMessage}
        </div>
      )}
      {!isLoading &&
        spaces.map((space) => {
          const notes = spaceNotesMap?.[space.id] ?? [];
          return (
            <SidebarSpaceGroup
              key={space.id}
              name={space.name}
              onCreateNote={() => onCreateNote(space.id)}
              onSettingsClick={
                onSettingsClick ? () => onSettingsClick(space) : undefined
              }
            >
              {notes.length === 0 ? (
                <div className="px-5 py-1 text-xs text-muted-foreground italic pl-9">
                  No notes
                </div>
              ) : (
                notes.map((note) => (
                  <SidebarPageItem
                    key={note.id}
                    id={note.id}
                    emoji={note.emoji}
                    title={note.title}
                  />
                ))
              )}
            </SidebarSpaceGroup>
          );
        })}
    </SidebarSection>
  );
}
