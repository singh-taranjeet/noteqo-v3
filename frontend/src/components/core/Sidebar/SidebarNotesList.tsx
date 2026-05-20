import { ChevronRight, Plus, FileText, Search } from "lucide-react";

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
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
import { useSpaces, useActiveSpace } from "@/features/spaces";
import { useCreateNote } from "@/features/workspace";
import { SidebarNoteTreeItem } from "./SidebarNoteTreeItem";
import { SidebarHoverCard } from "./SidebarHoverCard";
import type { NoteTreeNode } from "@/features/workspace";

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
      return { ...node, children: filteredChildren };
    }
  } else if (isMatch) {
    return node;
  }

  return null;
}

export function SidebarNotesList() {
  const { activeSpaceId } = useActiveSpace();
  const { spaceNoteTreesMap } = useSpaces();
  const { mutate: createNote } = useCreateNote();
  const params = useParams();
  const activeNoteId = params?.note_id as string | undefined;

  const [searchQuery, setSearchQuery] = useState("");

  const noteTrees = useMemo(() => {
    if (!spaceNoteTreesMap) return [];

    if (activeSpaceId) {
      return spaceNoteTreesMap[activeSpaceId] ?? [];
    }

    // "All Spaces" — merge all trees
    return Object.values(spaceNoteTreesMap).flat();
  }, [activeSpaceId, spaceNoteTreesMap]);

  const filteredNotes = useMemo(() => {
    let notes = noteTrees;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes
        .map((note) => filterNodeTree(note, query))
        .filter((note): note is NoteTreeNode => note !== null);
    }
    return notes;
  }, [noteTrees, searchQuery]);

  const handleCreateNote = () => {
    if (activeSpaceId) {
      createNote({ spaceId: activeSpaceId });
    }
  };

  if (noteTrees.length === 0) {
    return (
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip="Notes"
              className="font-medium cursor-pointer"
            >
              <FileText size={16} strokeWidth={1.5} />
              <span>Notes</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <SidebarHoverCard
            title="Search Notes"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search notes..."
            trigger={
              <SidebarMenuAction
                className={activeSpaceId ? "right-14" : "right-7"}
                aria-label="Search notes"
              >
                <Search size={14} strokeWidth={2} />
              </SidebarMenuAction>
            }
          >
            {filteredNotes.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No matching notes found.
              </div>
            ) : (
              <SidebarMenuSub className="mr-0 pr-0 border-none">
                {filteredNotes.map((note) => (
                  <SidebarNoteTreeItem
                    spaceId={note.spaceId}
                    key={note.id}
                    note={note}
                    activeNoteId={activeNoteId}
                  />
                ))}
              </SidebarMenuSub>
            )}
          </SidebarHoverCard>
          {activeSpaceId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuAction
                  className="right-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateNote();
                  }}
                  aria-label="Create note"
                >
                  <Plus size={14} strokeWidth={2} />
                </SidebarMenuAction>
              </TooltipTrigger>
              <TooltipContent side="right">New note</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight size={14} />
                </SidebarMenuAction>
              </CollapsibleTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">Toggle</TooltipContent>
          </Tooltip>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton className="text-muted-foreground">
                  <span className="text-xs italic">No notes yet</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip="Notes"
            className="font-medium cursor-pointer"
          >
            <FileText size={16} strokeWidth={1.5} />
            <span>Notes</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <SidebarHoverCard
          title="Search Notes"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search notes..."
          trigger={
            <SidebarMenuAction
              className={activeSpaceId ? "right-14" : "right-7"}
              aria-label="Search notes"
            >
              <Search size={14} strokeWidth={2} />
            </SidebarMenuAction>
          }
        >
          {filteredNotes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              No matching notes found.
            </div>
          ) : (
            <SidebarMenuSub className="mr-0 pr-0 border-none">
              {filteredNotes.map((note) => (
                <SidebarNoteTreeItem
                  spaceId={note.spaceId}
                  key={note.id}
                  note={note}
                  activeNoteId={activeNoteId}
                />
              ))}
            </SidebarMenuSub>
          )}
        </SidebarHoverCard>
        {activeSpaceId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuAction
                className="right-7"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNote();
                }}
                aria-label="Create note"
              >
                <Plus size={14} strokeWidth={2} />
              </SidebarMenuAction>
            </TooltipTrigger>
            <TooltipContent side="right">New note</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight size={14} />
              </SidebarMenuAction>
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle</TooltipContent>
        </Tooltip>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {noteTrees.map((note) => (
              <SidebarNoteTreeItem
                spaceId={note.spaceId}
                key={note.id}
                note={note}
                activeNoteId={activeNoteId}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
