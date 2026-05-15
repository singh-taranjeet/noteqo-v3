import { ChevronRight } from "lucide-react";

import { useState, useMemo } from "react";
import { SidebarNoteItem } from "./SidebarNoteItem";
import { SidebarHoverCard } from "./SidebarHoverCard";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRecentNotes } from "@/features/workspace";

export function RecentSection() {
  const { notes, isLoading } = useRecentNotes();
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const recentNotes = notes.slice(0, 10);

  const filteredExtraNotes = useMemo(() => {
    let extra = notes.slice(10);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      extra = extra.filter((note) => note.title.toLowerCase().includes(query));
    }
    return extra;
  }, [notes, searchQuery]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
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
            <span className="text-sm ">Recent</span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
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
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {!isLoading && recentNotes.length === 0 && (
              <div className="px-3 py-1.5 text-xs text-muted-foreground">
                No recent notes
              </div>
            )}
            {!isLoading && recentNotes.length > 0 && (
              <SidebarMenu>
                {recentNotes.map((note) => (
                  <SidebarMenuItem key={note.id}>
                    <SidebarNoteItem
                      spaceId={note.spaceId}
                      noteId={note.id}
                      emoji={note.emoji}
                      title={note.title}
                    />
                  </SidebarMenuItem>
                ))}
                {Array.isArray(notes) && (
                  <SidebarMenuItem>
                    <SidebarHoverCard
                      title="More Recent Notes"
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      searchPlaceholder="Search recent notes..."
                      trigger={
                        <SidebarMenuButton
                          size="sm"
                          className="text-muted-foreground w-full flex justify-between group/more-btn"
                        >
                          <span>More</span>
                          <ChevronRight
                            size={14}
                            className="opacity-0 group-hover/more-btn:opacity-100 transition-opacity"
                          />
                        </SidebarMenuButton>
                      }
                    >
                      {filteredExtraNotes.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          No matching notes found.
                        </div>
                      ) : (
                        <SidebarMenu>
                          {filteredExtraNotes.map((note) => (
                            <SidebarMenuItem key={note.id}>
                              <SidebarNoteItem
                                spaceId={note.spaceId}
                                noteId={note.id}
                                emoji={note.emoji}
                                title={note.title}
                              />
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      )}
                    </SidebarHoverCard>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
