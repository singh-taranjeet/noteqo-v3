"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppShell } from "../AppShell";
import { LAYOUT_CONFIG } from "../layout.constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { SidebarPageItem } from "./SidebarPageItem";
import { useRecentNotes, type Note } from "@/features/workspace";
import { useSpaces } from "@/features/spaces";
import { SPACE_TYPE } from "@/features/spaces";

export function SecondarySidebar() {
  const { secondarySidebarType, closeSecondarySidebar } = useAppShell();
  const { notes, isLoading: recentLoading } = useRecentNotes();
  const {
    data: spacesData,
    spaceNotesMap,
    isLoading: spacesLoading,
  } = useSpaces();
  const [searchQuery, setSearchQuery] = useState("");

  const isOpen = secondarySidebarType !== null;

  const title = useMemo(() => {
    switch (secondarySidebarType) {
      case "recent":
        return "Recent Notes";
      case "shared":
        return "Shared Notes";
      case "private":
        return "Private Notes";
      default:
        return "";
    }
  }, [secondarySidebarType]);

  const items = useMemo(() => {
    if (!secondarySidebarType) return [];

    let filteredNotes: Note[] = [];

    if (secondarySidebarType === "recent") {
      filteredNotes = notes;
    } else if (secondarySidebarType === "shared") {
      const sharedSpaces =
        (spacesData?.spaces || []).filter(
          (s) => s.type === SPACE_TYPE.SHARED,
        ) || [];
      filteredNotes = sharedSpaces.flatMap(
        (space) => spaceNotesMap?.[space.id] || [],
      );
    } else if (secondarySidebarType === "private") {
      const privateSpaces =
        (spacesData?.spaces || []).filter(
          (s) => s.type === SPACE_TYPE.PERSONAL,
        ) || [];
      filteredNotes = privateSpaces.flatMap(
        (space) => spaceNotesMap?.[space.id] || [],
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter((note) =>
        note.title.toLowerCase().includes(query),
      );
    }

    return filteredNotes;
  }, [secondarySidebarType, notes, spacesData, spaceNotesMap, searchQuery]);

  const isLoading = recentLoading || spacesLoading;

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden",
        "transition-all ease-in-out",
        !isOpen && "border-r-0",
      )}
      style={{
        width: isOpen ? `${LAYOUT_CONFIG.SIDEBAR_WIDTH}px` : "0px",
        opacity: isOpen ? 1 : 0,
        transitionDuration: `${LAYOUT_CONFIG.TRANSITION_DURATION}ms`,
      }}
      aria-hidden={!isOpen}
    >
      <div
        className="flex flex-col h-full overflow-hidden w-full"
        style={{ minWidth: `${LAYOUT_CONFIG.SIDEBAR_WIDTH}px` }}
      >
        <div className="flex items-center justify-between p-3 h-[52px] border-b border-sidebar-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={closeSecondarySidebar}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
          </Button>
        </div>

        <div className="p-3 shrink-0">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
          {isLoading ? (
            <div className="px-5 py-2 text-xs text-muted-foreground animate-pulse">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="px-5 py-2 text-xs text-muted-foreground">
              No notes found.
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 px-2">
              {items.map((note) => (
                <SidebarPageItem
                  key={note.id}
                  id={note.id}
                  emoji={note.emoji}
                  title={note.title}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
