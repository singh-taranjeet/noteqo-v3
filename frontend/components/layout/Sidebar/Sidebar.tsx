"use client";

import { cn } from "@/lib/utils";
import { useAppShell } from "../AppShell";
import { LAYOUT_CONFIG } from "../layout.constants";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarNavTabs } from "./SidebarNavTabs";
import { SidebarSection } from "./SidebarSection";
import { SidebarSpaceGroup } from "./SidebarSpaceGroup";
import { SidebarPageItem } from "./SidebarPageItem";
import { SidebarNewNoteButton } from "./SidebarNewNoteButton";
import { useSpaces } from "@/features/spaces";
import {
  useRemoteNotes,
  useCreateNote,
  useSyncQueue,
} from "@/features/workspace";
import { MOCK_USER } from "@/features/auth/constants/auth.constants";
import { SPACE_TYPE } from "@/features/spaces/constants/spaces.constants";

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAppShell();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const { data: spaceNotesMap, isLoading: notesLoading } =
    useRemoteNotes(spaces.length > 0 ? spaces : undefined);
  const { mutate: createNote } = useCreateNote();

  // Start background sync queue
  useSyncQueue();

  const isLoading = spacesLoading || notesLoading;

  // Filter spaces by type
  const personalSpaces = spaces.filter(
    (s) => s.type === SPACE_TYPE.PERSONAL,
  );

  const handleCreateNote = (spaceId: string) => {
    createNote({ spaceId });
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
            username={MOCK_USER.NAME}
            avatarEmoji={MOCK_USER.AVATAR}
            onCloseSidebar={toggleSidebar}
          />
          <SidebarNavTabs />

          <SidebarSection label="Private">
            {isLoading && (
              <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
                Loading spaces...
              </div>
            )}
            {personalSpaces.map((space) => {
              const notes = spaceNotesMap?.[space.id] ?? [];
              return (
                <SidebarSpaceGroup
                  key={space.id}
                  name={space.name}
                  onCreateNote={() => handleCreateNote(space.id)}
                >
                  {notes.map((note) => (
                    <SidebarPageItem
                      key={note.id}
                      id={note.id}
                      emoji={note.emoji}
                      title={note.title}
                    />
                  ))}
                  {notes.length === 0 && !isLoading && (
                    <div className="px-5 py-1.5 text-xs text-muted-foreground">
                      No notes yet
                    </div>
                  )}
                </SidebarSpaceGroup>
              );
            })}
          </SidebarSection>
        </div>

        {/* Sticky bottom */}
        <SidebarNewNoteButton
          onCreateNote={() => {
            // Create in the first personal space by default
            const defaultSpace = personalSpaces[0];
            if (defaultSpace) {
              handleCreateNote(defaultSpace.id);
            }
          }}
        />
      </div>
    </aside>
  );
}
