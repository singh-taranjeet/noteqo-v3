"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppShell } from "../AppShell";
import { LAYOUT_CONFIG } from "../layout.constants";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarNavTabs } from "./SidebarNavTabs";
import { SidebarSection } from "./SidebarSection";
import { SidebarPageItem } from "./SidebarPageItem";
import { SidebarSpaceGroup } from "./SidebarSpaceGroup";
import { SharedSpaceSettingsDialog } from "./SharedSpaceSettingsDialog";
import { SidebarNewNoteButton } from "./SidebarNewNoteButton";
import { useSpaces, useCreateSpace } from "@/features/spaces";
import {
  useRemoteNotes,
  useCreateNote,
  useSyncQueue,
} from "@/features/workspace";
import { MOCK_USER } from "@/features/auth/constants/auth.constants";
import { SPACE_TYPE } from "@/features/spaces/constants/spaces.constants";
import type { Space, SpaceType } from "@/features/spaces/types/spaces.types";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logService } from "@/services/log.service";

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
  const { data: spaceNotesMap, isLoading: notesLoading } =
    useRemoteNotes(spaces.length > 0 ? spaces : undefined);
  const { mutate: createNote } = useCreateNote();
  const { createSpace, isLoading: isCreatingSpace } = useCreateSpace();
  
  // Track which type of space is being created to show the correct dialog
  const [createSpaceType, setCreateSpaceType] = useState<SpaceType | null>(null);
  
  // Track which space we are managing settings for
  const [settingsSpace, setSettingsSpace] = useState<Space | null>(null);

  // Start background sync queue
  useSyncQueue();

  const isLoading = spacesLoading || notesLoading;

  // Filter spaces by type
  const personalSpaces = spaces.filter(
    (s) => s.type === SPACE_TYPE.PERSONAL,
  );
  
  const sharedSpaces = spaces.filter(
    (s) => s.type === SPACE_TYPE.SHARED,
  );
  
  const defaultPersonalSpace = personalSpaces.find(pesonalSpace => pesonalSpace.isDefault);
  const defaultSharedSpace = sharedSpaces.find(sharedSpace => sharedSpace.isDefault) || sharedSpaces[0];

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
          <SidebarNavTabs />

          {/* Shared Spaces Section */}
          <SidebarSection
            label="Shared"
            action={
              <TooltipProvider>
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (defaultSharedSpace) {
                            handleCreateNote(defaultSharedSpace.id);
                          }
                        }}
                        aria-label="Create shared note"
                        disabled={!defaultSharedSpace}
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          size={14}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create shared note</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreateSpaceType(SPACE_TYPE.SHARED);
                        }}
                        aria-label="Create shared space"
                      >
                        <HugeiconsIcon
                          icon={Add01Icon}
                          size={14}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create shared space</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            }
          >
            {isLoading && (
              <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
                Loading spaces...
              </div>
            )}
            {!isLoading && sharedSpaces.length === 0 && (
              <div className="px-5 py-1.5 text-xs text-muted-foreground">
                No shared spaces
              </div>
            )}
            {!isLoading && sharedSpaces.map((space) => {
              const notes = spaceNotesMap?.[space.id] ?? [];
              return (
                <SidebarSpaceGroup
                  key={space.id}
                  name={space.name}
                  onCreateNote={() => handleCreateNote(space.id)}
                  onSettingsClick={() => setSettingsSpace(space)}
                >
                  {notes.length === 0 ? (
                    <div className="px-5 py-1 text-xs text-muted-foreground italic pl-9">
                      No notes
                    </div>
                  ) : (
                    notes.map((note) => (
                      <SidebarPageItem
                        key={note.id}
                        id={note.id}
                        emoji={note.emoji}
                        title={note.title}
                      />
                    ))
                  )}
                </SidebarSpaceGroup>
              );
            })}
          </SidebarSection>

          {/* Private Spaces Section */}
          <SidebarSection
            label="Private"
            action={
              <TooltipProvider>
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (defaultPersonalSpace) {
                            handleCreateNote(defaultPersonalSpace.id);
                          }
                        }}
                        aria-label="Create private note"
                      >
                        <HugeiconsIcon
                          icon={PencilEdit01Icon}
                          size={14}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create private note</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreateSpaceType(SPACE_TYPE.PERSONAL);
                        }}
                        aria-label="Create private space"
                      >
                        <HugeiconsIcon
                          icon={Add01Icon}
                          size={14}
                          strokeWidth={2}
                          className="text-muted-foreground"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create private space</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            }
          >
            {isLoading && (
              <div className="px-4 py-2 text-xs text-muted-foreground animate-pulse">
                Loading spaces...
              </div>
            )}
            {!isLoading && personalSpaces.length === 0 && (
              <div className="px-5 py-1.5 text-xs text-muted-foreground">
                No spaces yet
              </div>
            )}
            {!isLoading && personalSpaces.map((space) => {
              const notes = spaceNotesMap?.[space.id] ?? [];
              return (
                <SidebarSpaceGroup
                  key={space.id}
                  name={space.name}
                  onCreateNote={() => handleCreateNote(space.id)}
                >
                  {notes.length === 0 ? (
                    <div className="px-5 py-1 text-xs text-muted-foreground italic pl-9">
                      No notes
                    </div>
                  ) : (
                    notes.map((note) => (
                      <SidebarPageItem
                        key={note.id}
                        id={note.id}
                        emoji={note.emoji}
                        title={note.title}
                      />
                    ))
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
