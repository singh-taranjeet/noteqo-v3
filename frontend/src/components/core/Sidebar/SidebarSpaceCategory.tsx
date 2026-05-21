import { ChevronRight, MoreHorizontal, Plus, Search } from "lucide-react";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Space } from "@/features/spaces";
import { useParams, useNavigate } from "react-router-dom";
import type { NoteTreeNode } from "@/features/workspace";
import { SidebarNoteTreeItem } from "./SidebarNoteTreeItem";
import { SidebarHoverCard } from "./SidebarHoverCard";
import { EmojiOrImage } from "@/features/media";
import { ROUTES } from "@/constants/routes.constants";

interface SidebarSpaceCategoryProps {
  label: string;
  spaces: Space[];
  isLoading: boolean;
  emptyMessage: string;
  spaceNoteTreesMap: Record<string, NoteTreeNode[]> | undefined;
  onAddSpaceClick: () => void;
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
  onCreateNote,
  onSettingsClick,
}: Readonly<SidebarSpaceCategoryProps>) {
  const [searchQuery, setSearchQuery] = useState("");

  const allNotes = useMemo(() => {
    return spaces.flatMap((space) => spaceNoteTreesMap?.[space.id] || []);
  }, [spaces, spaceNoteTreesMap]);

  const filteredNotes = useMemo(() => {
    let notes = allNotes;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      notes = notes
        .map((note) => filterNodeTree(note, query))
        .filter((note): note is NoteTreeNode => note !== null);
    }
    return notes;
  }, [allNotes, searchQuery]);

  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="font-medium cursor-pointer">
            <span>{label}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        {/* Search notes in this category */}
        <SidebarHoverCard
          title={`Search ${label} Notes`}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={`Search ${label.toLowerCase()}...`}
          trigger={
            <SidebarMenuAction
              className="right-14"
              aria-label={`Search ${label} notes`}
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
            <SidebarMenuSub className="border-none">
              {filteredNotes.map((note) => (
                <SidebarMenuSubItem key={note.id}>
                  <SidebarMenuSubButton asChild>
                    <Link to={ROUTES.NOTE(note.id)}>
                      <span
                        className="shrink-0 text-base"
                        role="img"
                        aria-hidden="true"
                      >
                        <EmojiOrImage
                          emoji={note.emoji}
                          spaceId={note.spaceId}
                        />
                      </span>
                      <span className="text-sm truncate">
                        {note.title || "Untitled"}
                      </span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarHoverCard>

        {/* Add space action */}
        <SidebarMenuAction
          className="right-7"
          onClick={(e) => {
            e.stopPropagation();
            onAddSpaceClick();
          }}
          aria-label={`Create ${label.toLowerCase()}`}
        >
          <Plus size={14} strokeWidth={2} />
        </SidebarMenuAction>

        {/* Collapsible chevron */}
        <CollapsibleTrigger asChild>
          <SidebarMenuAction className="data-[state=open]:rotate-90">
            <ChevronRight size={14} />
          </SidebarMenuAction>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {isLoading && (
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <div className="h-6 w-full animate-pulse rounded bg-sidebar-accent" />
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <div className="h-6 w-full animate-pulse rounded bg-sidebar-accent" />
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          )}

          {!isLoading && spaces.length === 0 && (
            <SidebarMenuSub>
              <div className="px-3 py-1.5 text-xs text-muted-foreground">
                {emptyMessage}
              </div>
            </SidebarMenuSub>
          )}

          {!isLoading && spaces.length > 0 && (
            <SidebarMenuSub>
              {spaces.map((space) => {
                const noteTrees = spaceNoteTreesMap?.[space.id] ?? [];
                return (
                  <SpaceSubItem
                    key={space.id}
                    space={space}
                    noteTrees={noteTrees}
                    onCreateNote={() => onCreateNote(space.id)}
                    onSettingsClick={
                      onSettingsClick ? () => onSettingsClick(space) : undefined
                    }
                  />
                );
              })}
            </SidebarMenuSub>
          )}
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// SpaceSubItem – a single space rendered as a collapsible sub-item
// ---------------------------------------------------------------------------

interface SpaceSubItemProps {
  space: Space;
  noteTrees: NoteTreeNode[];
  onCreateNote: () => void;
  onSettingsClick?: () => void;
}

function SpaceSubItem({
  space,
  noteTrees,
  onCreateNote,
  onSettingsClick,
}: SpaceSubItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();
  const navigate = useNavigate();
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuSubItem>
        <div className="flex items-center w-full relative group/space-item">
          <CollapsibleTrigger asChild>
            <button
              className="absolute left-0 w-6 h-6 flex items-center justify-center z-10 hover:bg-sidebar-accent rounded-sm text-sidebar-foreground"
              aria-label={`Toggle ${space.name}`}
            >
              <ChevronRight
                size={10}
                strokeWidth={2}
                className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton className="pl-6 w-full capitalize font-medium cursor-pointer">
              <span className="text-sm">{space.name}</span>
            </SidebarMenuSubButton>
          </CollapsibleTrigger>

          {/* Hover-revealed actions */}
          <div className="absolute right-1 flex items-center gap-0.5 opacity-0 group-hover/space-item:opacity-100 transition-opacity">
            {onSettingsClick && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-sidebar-accent text-sidebar-foreground"
                    aria-label={`Actions for ${space.name}`}
                  >
                    <MoreHorizontal size={14} strokeWidth={2} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/spaces/${space.id}`);
                    }}
                  >
                    Manage
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick();
                    }}
                  >
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button
              className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-sidebar-accent text-sidebar-foreground"
              onClick={onCreateNote}
              aria-label={`Create note in ${space.name}`}
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

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
                    spaceId={note.spaceId}
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
                              spaceId={note.spaceId}
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
      </SidebarMenuSubItem>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Helper – recursively filter a note tree by title query
// ---------------------------------------------------------------------------

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
