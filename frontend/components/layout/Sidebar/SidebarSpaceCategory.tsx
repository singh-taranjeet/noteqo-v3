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

import type { Space } from "@/features/spaces";
import { useParams } from "next/navigation";
import type { NoteTreeNode } from "@/features/workspace/types/workspace.types";
import { SidebarNoteTreeItem } from "./SidebarNoteTreeItem";

interface SidebarSpaceCategoryProps {
  label: string;
  spaces: Space[];
  isLoading: boolean;
  emptyMessage: string;
  spaceNoteTreesMap: Record<string, NoteTreeNode[]> | undefined;
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
  spaceNoteTreesMap,
  onAddSpaceClick,
  addSpaceTooltip,
  onCreateNote,
  onSettingsClick,
}: Readonly<SidebarSpaceCategoryProps>) {
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
            <span className="text-base font-medium">{label}</span>
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
                  const noteTrees = spaceNoteTreesMap?.[space.id] ?? [];
                  return (
                    <SpaceGroupItem
                      key={space.id}
                      space={space}
                      noteTrees={noteTrees}
                      onCreateNote={() => onCreateNote(space.id)}
                      onSettingsClick={
                        onSettingsClick
                          ? () => onSettingsClick(space)
                          : undefined
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
  noteTrees: NoteTreeNode[];
  onCreateNote: () => void;
  onSettingsClick?: () => void;
}

function SpaceGroupItem({
  space,
  noteTrees,
  onCreateNote,
  onSettingsClick,
}: SpaceGroupItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const params = useParams();
  const activeNoteId = params?.note_id as string | undefined;

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
            <span className="text-base font-medium">📁 {space.name}</span>
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
          <SidebarMenuSub className="mr-0 pr-0">
            {noteTrees.length === 0 ? (
              <div className="px-2 py-1 text-xs text-muted-foreground italic">
                No notes
              </div>
            ) : (
              <>
                {noteTrees.map((note) => (
                  <SidebarNoteTreeItem
                    key={note.id}
                    note={note}
                    activeNoteId={activeNoteId}
                  />
                ))}
              </>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
