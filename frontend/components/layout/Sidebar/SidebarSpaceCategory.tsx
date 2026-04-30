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
import { useAppShell } from "../AppShell";
import { SPACE_TYPE } from "@/features/spaces";
import type { Space } from "@/features/spaces";
import type { Note } from "@/features/workspace";

interface SidebarSpaceCategoryProps {
  label: string;
  type: string;
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
  type,
  spaces,
  isLoading,
  emptyMessage,
  spaceNotesMap,
  onAddSpaceClick,
  addSpaceTooltip,
  onCreateNote,
  onSettingsClick,
}: Readonly<SidebarSpaceCategoryProps>) {
  const { openSecondarySidebar } = useAppShell();
  const secondarySidebarType =
    type === SPACE_TYPE.SHARED ? "shared" : "private";

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
          const displayNotes = notes.slice(0, 10);
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
                <div className="flex flex-col gap-0.5">
                  {displayNotes.map((note) => (
                    <div key={note.id} className="pl-3 pr-2">
                      <SidebarPageItem
                        id={note.id}
                        emoji={note.emoji}
                        title={note.title}
                      />
                    </div>
                  ))}
                  {notes.length > 10 && (
                    <div className="pl-3 pr-2 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-7 text-xs font-normal text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          openSecondarySidebar(secondarySidebarType)
                        }
                      >
                        More
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </SidebarSpaceGroup>
          );
        })}
    </SidebarSection>
  );
}
