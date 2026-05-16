import { ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { useRecentNotes } from "@/features/workspace";
import { ROUTES } from "@/constants/routes";
import { SidebarHoverCard } from "./SidebarHoverCard";
import { EmojiOrImage } from "@/features/media/components/EmojiOrImage";

/**
 * Renders recent notes as SidebarMenuSub items.
 * Used inside the collapsible Home section of the sidebar.
 */
export function RecentSubMenu() {
  const { notes, isLoading } = useRecentNotes();
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

  if (isLoading) {
    return (
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <div className="h-6 w-full animate-pulse rounded bg-sidebar-accent" />
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <div className="h-6 w-full animate-pulse rounded bg-sidebar-accent" />
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    );
  }

  if (recentNotes.length === 0) {
    return (
      <SidebarMenuSub>
        <div className="px-3 py-1.5 text-xs text-muted-foreground">
          No recent notes
        </div>
      </SidebarMenuSub>
    );
  }

  return (
    <SidebarMenuSub>
      {recentNotes.map((note) => (
        <SidebarMenuSubItem key={note.id}>
          <SidebarMenuSubButton asChild>
            <Link to={ROUTES.NOTE(note.id)}>
              <span
                className="shrink-0 text-base"
                role="img"
                aria-hidden="true"
              >
                <EmojiOrImage emoji={note.emoji} spaceId={note.spaceId} />
              </span>
              <span className="text-sm truncate">
                {note.title || "Untitled"}
              </span>
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
      {notes.length > 10 && (
        <SidebarMenuSubItem>
          <SidebarHoverCard
            title="More Recent Notes"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search recent notes..."
            trigger={
              <SidebarMenuSubButton
                size="sm"
                className="text-muted-foreground w-full flex justify-between group/more-btn cursor-pointer"
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
              <SidebarMenuSub className="border-none">
                {filteredExtraNotes.map((note) => (
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
        </SidebarMenuSubItem>
      )}
    </SidebarMenuSub>
  );
}
