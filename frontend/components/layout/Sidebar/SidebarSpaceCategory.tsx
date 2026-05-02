"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Add01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppShell } from "../AppShell";
import { SPACE_TYPE } from "@/features/spaces";
import type { Space } from "@/features/spaces";
import type { Note } from "@/features/workspace";
import { SidebarNoteItem } from "./SidebarNoteItem";

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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <Collapsible
      open={isCategoryOpen}
      onOpenChange={setIsCategoryOpen}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="cursor-pointer">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              strokeWidth={2}
              className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
            />
            {label}
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarGroupAction
              onClick={(e) => {
                e.stopPropagation();
                onAddSpaceClick();
              }}
              aria-label={addSpaceTooltip}
            >
              <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
            </SidebarGroupAction>
          </TooltipTrigger>
          <TooltipContent>{addSpaceTooltip}</TooltipContent>
        </Tooltip>
        <CollapsibleContent>
          <SidebarGroupContent>
            {isLoading && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {!isLoading && spaces.length === 0 && (
              <div className="px-3 py-1.5 text-xs text-muted-foreground">
                {emptyMessage}
              </div>
            )}
            {!isLoading && (
              <SidebarMenu>
                {spaces.map((space) => {
                  const notes = spaceNotesMap?.[space.id] ?? [];
                  const displayNotes = notes.slice(0, 10);
                  return (
                    <SpaceGroupItem
                      key={space.id}
                      space={space}
                      notes={displayNotes}
                      totalNoteCount={notes.length}
                      onCreateNote={() => onCreateNote(space.id)}
                      onSettingsClick={
                        onSettingsClick
                          ? () => onSettingsClick(space)
                          : undefined
                      }
                      onShowMore={() =>
                        openSecondarySidebar(
                          secondarySidebarType as "shared" | "private",
                        )
                      }
                    />
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

interface SpaceGroupItemProps {
  space: Space;
  notes: Note[];
  totalNoteCount: number;
  onCreateNote: () => void;
  onSettingsClick?: () => void;
  onShowMore: () => void;
}

function SpaceGroupItem({
  space,
  notes,
  totalNoteCount,
  onCreateNote,
  onSettingsClick,
  onShowMore,
}: SpaceGroupItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton size="sm">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={10}
              strokeWidth={2}
              className="transition-transform duration-200 data-[state=open]:rotate-90"
              data-state={isOpen ? "open" : "closed"}
            />
            <span>📁 {space.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        {onSettingsClick && (
          <SidebarMenuAction
            showOnHover
            onClick={onSettingsClick}
            aria-label={`Settings for ${space.name}`}
            className="right-7"
          >
            <HugeiconsIcon
              icon={MoreHorizontalIcon}
              size={14}
              strokeWidth={2}
            />
          </SidebarMenuAction>
        )}

        <SidebarMenuAction
          showOnHover
          onClick={onCreateNote}
          aria-label={`Create note in ${space.name}`}
        >
          <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
        </SidebarMenuAction>

        <CollapsibleContent>
          <SidebarMenuSub>
            {notes.length === 0 ? (
              <div className="px-2 py-1 text-xs text-muted-foreground italic">
                No notes
              </div>
            ) : (
              <>
                {notes.map((note) => (
                  <SidebarMenuSubItem key={note.id}>
                    <SidebarNoteItem
                      noteId={note.id}
                      emoji={note.emoji}
                      title={note.title}
                    />
                  </SidebarMenuSubItem>
                ))}
                {totalNoteCount > 10 && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      size="sm"
                      className="text-muted-foreground"
                      onClick={onShowMore}
                    >
                      More
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
              </>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
