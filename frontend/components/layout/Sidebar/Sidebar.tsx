"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppShell } from "../AppShell";
import { LAYOUT_CONFIG } from "../layout.constants";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarNavTabs } from "./SidebarNavTabs";
import { SidebarSpaceCategory } from "./SidebarSpaceCategory";
import { SharedSpaceSettingsDialog } from "./SharedSpaceSettingsDialog";
import { SidebarNewNoteButton } from "./SidebarNewNoteButton";
import { useSpaces, useCreateSpace } from "@/features/spaces";
import {
  useRemoteNotes,
  useCreateNote,
  useSyncQueue,
} from "@/features/workspace";
import { MOCK_USER } from "@/features/auth";
import { SPACE_TYPE } from "@/features/spaces";
import type { Space, SpaceType } from "@/features/spaces";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";
import type { ActiveTabType } from "../types";

const CREATE_SPACE_FIELDS: FormFieldConfig[] = [
  {
    name: "name",
    label: "Space Name",
    type: "text",
    required: true,
    placeholder: "e.g. My Vault",
  },
];

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAppShell();
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces();
  const { data: spaceNotesMap, isLoading: notesLoading } = useRemoteNotes(
    spaces.length > 0 ? spaces : undefined,
  );

  // Start background sync queue
  useSyncQueue();

  const { mutate: createNote } = useCreateNote();
  const { createSpace, isLoading: isCreatingSpace } = useCreateSpace();

  // Track which type of space is being created to show the correct dialog
  const [createSpaceType, setCreateSpaceType] = useState<SpaceType | null>(
    null,
  );

  // Track which space we are managing settings for
  const [settingsSpace, setSettingsSpace] = useState<Space | null>(null);

  const isLoading = spacesLoading || notesLoading;

  // Filter spaces by type
  const personalSpaces = spaces.filter((s) => s.type === SPACE_TYPE.PERSONAL);

  const sharedSpaces = spaces.filter((s) => s.type === SPACE_TYPE.SHARED);

  const [activeTab, setActiveTab] = useState<ActiveTabType>("home");

  const defaultPersonalSpace = personalSpaces.find(
    (pesonalSpace) => pesonalSpace.isDefault,
  );

  const handleCreateNote = (spaceId: string) => {
    createNote({ spaceId });
  };

  const handleCreateSpaceSubmit = async (values: FormValues) => {
    if (!createSpaceType) return;
    const spaceName = values.name as string;
    await createSpace(spaceName, createSpaceType);
    setCreateSpaceType(null);
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
          <SidebarNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Shared Spaces Section */}
          <SidebarSpaceCategory
            label="Shared"
            spaces={sharedSpaces}
            isLoading={isLoading}
            emptyMessage="No shared spaces"
            spaceNotesMap={spaceNotesMap}
            onAddSpaceClick={() => setCreateSpaceType(SPACE_TYPE.SHARED)}
            addSpaceTooltip="Create shared space"
            onCreateNote={handleCreateNote}
            onSettingsClick={(space) => setSettingsSpace(space)}
          />

          {/* Private Spaces Section */}
          <SidebarSpaceCategory
            label="Private"
            spaces={personalSpaces}
            isLoading={isLoading}
            emptyMessage="No spaces yet"
            spaceNotesMap={spaceNotesMap}
            onAddSpaceClick={() => setCreateSpaceType(SPACE_TYPE.PERSONAL)}
            addSpaceTooltip="Create private space"
            onCreateNote={handleCreateNote}
          />
        </div>

        {/* Sticky bottom */}
        <SidebarNewNoteButton
          onCreateNote={() => {
            // Create in the first personal space by default
            if (defaultPersonalSpace) {
              handleCreateNote(defaultPersonalSpace.id);
            }
          }}
        />
      </div>

      <DynamicDialog
        title={`Create ${createSpaceType === SPACE_TYPE.SHARED ? "Shared" : "Private"} Space`}
        description={
          createSpaceType === SPACE_TYPE.SHARED
            ? "A shared space that you can securely collaborate with others on."
            : "A private space where only you can access your encrypted notes."
        }
        isOpen={createSpaceType !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setCreateSpaceType(null);
        }}
      >
        <div className="py-2">
          <DynamicForm
            fields={CREATE_SPACE_FIELDS}
            onSubmit={handleCreateSpaceSubmit}
            submitLabel="Create Space"
            loadingLabel="Creating..."
            isLoading={isCreatingSpace}
          />
        </div>
      </DynamicDialog>

      <SharedSpaceSettingsDialog
        space={settingsSpace}
        isOpen={settingsSpace !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSettingsSpace(null);
        }}
      />
    </aside>
  );
}
