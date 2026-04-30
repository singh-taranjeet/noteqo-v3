"use client";

import { SidebarSection } from "./SidebarSection";
import { SidebarPageItem } from "./SidebarPageItem";
import { Button } from "@/components/ui/button";
import { useRecentNotes } from "@/features/workspace";
import { useAppShell } from "../AppShell";

export function RecentSection() {
  const { notes, isLoading } = useRecentNotes();
  const { openSecondarySidebar } = useAppShell();

  const recentNotes = notes.slice(0, 10);

  return (
    <SidebarSection label="Recent" defaultOpen>
      {isLoading && (
        <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
          Loading recent...
        </div>
      )}
      {!isLoading && recentNotes.length === 0 && (
        <div className="px-5 py-1.5 text-xs text-muted-foreground">
          No recent notes
        </div>
      )}
      {!isLoading && recentNotes.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {recentNotes.map((note) => (
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
                onClick={() => openSecondarySidebar("recent")}
              >
                More
              </Button>
            </div>
          )}
        </div>
      )}
    </SidebarSection>
  );
}
