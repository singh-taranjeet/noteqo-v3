import { ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";

import { useState } from "react";
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
  SidebarMenuSubItem,
  SidebarMenuSubButton,
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
import { useParams } from "react-router-dom";
import type { NoteTreeNode } from "@/features/workspace/types/workspace.types";
import { SidebarNoteTreeItem } from "./SidebarNoteTreeItem";

import { SidebarHoverCard } from "./SidebarHoverCard";
import { SidebarNoteItem } from "./SidebarNoteItem";
import { useMemo } from "react";

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

function filterNodeTree(
  node: NoteTreeNode,
  query: string,
): NoteTreeNode | null {
  const isMatch = (node.title || "Untitled").toLowerCase().includes(query);

  if (node.children && node.children.length > 0) {
    const filteredChildren = node.children
      .map((child) => filterNodeTree(child, query))
      .filter((child): child is NoteTreeNode => child !== null);

    if (isMatch || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }
  } else if (isMatch) {
    return node;
  }

  return null;
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
  const [searchQuery, setSearchQuery] = useState("");

  const allNotes = useMemo(() => {
    return spaces.flatMap((space) => spaceNoteTreesMap?.[space.id] || []);
  }, [spaces, spaceNoteTreesMap]);

  const filteredNotes = useMemo(() => {
    let extra = allNotes;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      extra = extra
        .map((note) => filterNodeTree(note, query))
        .filter((note): note is NoteTreeNode => note !== null);
    }
    return extra;
  }, [allNotes, searchQuery]);

  return (
    <Collapsible
      open={isCategoryOpen}
      onOpenChange={setIsCategoryOpen}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="cursor-pointer">
            <ChevronRight
              size={12}
              strokeWidth={2}
              className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
            />
            <span className="text-sm ">{label}</span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        {/* Search / All Notes HoverCard */}
        <SidebarHoverCard
          title={`Search ${label} Notes`}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          trigger={
            <SidebarGroupAction
              className="right-9"
              aria-label={`Search ${label} notes`}
            >
              <Search size={14} strokeWidth={2} />
            </SidebarGroupAction>
          }
        >
          {filteredNotes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No matching notes found.
            </div>
          ) : (
            <SidebarMenu>
              {filteredNotes.map((note) => (
                <SidebarMenuItem key={note.id}>
                  <SidebarNoteItem
                    noteId={note.id}
                    emoji={note.emoji}
                    title={note.title}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarHoverCard>

        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarGroupAction
              onClick={(e) => {
                e.stopPropagation();
                onAddSpaceClick();
              }}
              aria-label={addSpaceTooltip}
            >
              <Plus size={14} strokeWidth={2} />
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
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();
  const activeNoteId = params?.note_id as string | undefined;

  const visibleNotes = noteTrees.slice(0, 5);

  const filteredExtraNotes = useMemo(() => {
    let extra = noteTrees.slice(5);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      extra = extra
        .map((note) => filterNodeTree(note, query))
        .filter((note): note is NoteTreeNode => note !== null);
    }
    return extra;
  }, [noteTrees, searchQuery]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton size="sm">
            <ChevronRight
              size={10}
              strokeWidth={2}
              className="transition-transform duration-200 data-[state=open]:rotate-90"
              data-state={isOpen ? "open" : "closed"}
            />
            <span className="text-sm capitalize">{space.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        {onSettingsClick && (
          <SidebarMenuAction
            showOnHover
            onClick={onSettingsClick}
            aria-label={`Settings for ${space.name}`}
            className="right-7"
          >
            <MoreHorizontal size={14} strokeWidth={2} />
          </SidebarMenuAction>
        )}

        <SidebarMenuAction
          showOnHover
          onClick={onCreateNote}
          aria-label={`Create note in ${space.name}`}
        >
          <Plus size={14} strokeWidth={2} />
        </SidebarMenuAction>

        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {noteTrees.length === 0 ? (
              <div className="px-2 py-1 text-xs text-muted-foreground italic">
                No notes
              </div>
            ) : (
              <>
                {visibleNotes.map((note) => (
                  <SidebarNoteTreeItem
                    key={note.id}
                    note={note}
                    activeNoteId={activeNoteId}
                  />
                ))}
                {noteTrees.length > 5 && (
                  <SidebarMenuSubItem>
                    <SidebarHoverCard
                      title={`More ${space.name} Notes`}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      searchPlaceholder={`Search ${space.name}...`}
                      trigger={
                        <SidebarMenuSubButton
                          size="sm"
                          className="text-muted-foreground w-full flex justify-between group/more-btn pl-6 cursor-pointer"
                        >
                          <span>More</span>
                          <ChevronRight
                            size={14}
                            className="opacity-0 group-hover/more-btn:opacity-100 transition-opacity"
                          />
                        </SidebarMenuSubButton>
                      }
                    >
                      {filteredExtraNotes.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          No matching notes found.
                        </div>
                      ) : (
                        <SidebarMenuSub className="mr-0 pr-0 border-none">
                          {filteredExtraNotes.map((note) => (
                            <SidebarNoteTreeItem
                              key={note.id}
                              note={note}
                              activeNoteId={activeNoteId}
                            />
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarHoverCard>
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
