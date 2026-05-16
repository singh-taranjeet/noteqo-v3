import { ChevronRight, Plus, FileText } from "lucide-react";

import { useMemo } from "react";
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

export function SidebarNotesList() {
  const { activeSpaceId } = useActiveSpace();
  const { spaceNoteTreesMap } = useSpaces();
  const { mutate: createNote } = useCreateNote();
  const params = useParams();
  const activeNoteId = params?.note_id as string | undefined;

  const noteTrees = useMemo(() => {
    if (!spaceNoteTreesMap) return [];

    if (activeSpaceId) {
      return spaceNoteTreesMap[activeSpaceId] ?? [];
    }

    // "All Spaces" — merge all trees
    return Object.values(spaceNoteTreesMap).flat();
  }, [activeSpaceId, spaceNoteTreesMap]);

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
