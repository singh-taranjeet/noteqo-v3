"use client";

import { cn } from "@/lib/utils";
import { useAppShell } from "../AppShell";
import { LAYOUT_CONFIG } from "../layout.constants";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarNavTabs } from "./SidebarNavTabs";
import { SidebarSection } from "./SidebarSection";
import { SidebarPageItem } from "./SidebarPageItem";
import { SidebarNewNoteButton } from "./SidebarNewNoteButton";
import {
  useRemoteNotes,
  useCreateNote,
  useSyncQueue,
} from "@/features/workspace";
import { useMergeLocalRemote } from "@/features/workspace/hooks/useMergeLocalRemote";

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAppShell();
  const { data: notes = [], isLoading } = useRemoteNotes();
  const { mutate: createNote } = useCreateNote();

  // Start background sync queue
  useSyncQueue();

  // merge local and remote notes
  useMergeLocalRemote();

  const handleCreateNote = () => {
    createNote(undefined);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden",
        "transition-all ease-in-out",
      )}
      style={{
        width: isSidebarOpen
          ? `${LAYOUT_CONFIG.SIDEBAR_WIDTH}px`
          : `${LAYOUT_CONFIG.SIDEBAR_COLLAPSED_WIDTH}px`,
        transitionDuration: `${LAYOUT_CONFIG.TRANSITION_DURATION}ms`,
      }}
      aria-label="Sidebar navigation"
    >
      {/* Prevent content from shrinking during collapse */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ minWidth: `${LAYOUT_CONFIG.SIDEBAR_WIDTH}px` }}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarUserProfile
            username="Taranjeet Singh"
            avatarEmoji="😎"
            onCloseSidebar={toggleSidebar}
          />
          <SidebarNavTabs />

          <SidebarSection label="Private">
            {isLoading && (
              <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
                Decrypting remote notes...
              </div>
            )}
            {notes.map((note) => (
              <SidebarPageItem
                key={note.id}
                emoji={note.emoji}
                title={note.title}
              />
            ))}
          </SidebarSection>
        </div>

        {/* Sticky bottom */}
        <SidebarNewNoteButton onCreateNote={handleCreateNote} />
      </div>
    </aside>
  );
}
