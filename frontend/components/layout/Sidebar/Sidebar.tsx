"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAllMediaList } from "@/features/media";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarNavTabs } from "./SidebarNavTabs";
import { SidebarSpaceCategory } from "./SidebarSpaceCategory";
import { RecentSection } from "./RecentSection";
import { SharedSpaceSettingsDialog } from "./SharedSpaceSettingsDialog";
import { useSpaces, useCreateSpace } from "@/features/spaces";
import { useCreateNote, useSyncQueue } from "@/features/workspace";
import { MOCK_USER, useUserProfile } from "@/features/auth";
import { SPACE_TYPE } from "@/features/spaces";
import type { Space, SpaceType } from "@/features/spaces";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";
import type { ActiveTabType } from "../types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  Book02Icon,
  Delete01Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

const CREATE_SPACE_FIELDS: FormFieldConfig[] = [
  {
    name: "name",
    label: "Space Name",
    type: "text",
    required: true,
    placeholder: "e.g. My Vault",
  },
];

export function AppSidebar() {
  // Start background sync queue
  useSyncQueue();

  const { data, isLoading: spacesLoading, spaceNoteTreesMap } = useSpaces();
  const { spaces = [] } = data || {};

  // Prefetch media for all spaces so it's instantly available when opening the media picker
  useAllMediaList(spaces.map((s) => s.id));

  const { mutate: createNote } = useCreateNote();
  const { createSpace, isLoading: isCreatingSpace } = useCreateSpace();

  // Track which type of space is being created to show the correct dialog
  const [createSpaceType, setCreateSpaceType] = useState<SpaceType | null>(
    null,
  );

  // Track which space we are managing settings for
  const [settingsSpace, setSettingsSpace] = useState<Space | null>(null);

  const isLoading = spacesLoading;

  // Filter spaces by type
  const personalSpaces = spaces.filter((s) => s.type === SPACE_TYPE.PERSONAL);
  const sharedSpaces = spaces.filter((s) => s.type === SPACE_TYPE.SHARED);

  const [activeTab, setActiveTab] = useState<ActiveTabType>("home");

  const defaultPersonalSpace = personalSpaces.find(
    (personalSpace) => personalSpace.isDefault,
  );

  const { data: userProfile, isLoading: isUserProfileLoading } =
    useUserProfile();

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
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarUserProfile
          username={userProfile?.name || MOCK_USER.NAME}
          avatarEmoji={
            userProfile?.name
              ? userProfile.name.charAt(0).toUpperCase()
              : MOCK_USER.AVATAR
          }
          isLoading={isUserProfileLoading}
        />
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        {/* Recent Section */}
        <RecentSection />

        {/* Shared Spaces Section */}
        <SidebarSpaceCategory
          label="Shared"
          spaces={sharedSpaces}
          isLoading={isLoading}
          emptyMessage="No shared spaces"
          spaceNoteTreesMap={spaceNoteTreesMap}
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
          spaceNoteTreesMap={spaceNoteTreesMap}
          onAddSpaceClick={() => setCreateSpaceType(SPACE_TYPE.PERSONAL)}
          addSpaceTooltip="Create private space"
          onCreateNote={handleCreateNote}
        />

        {/* Utilities Section */}
        <SidebarGroup className="mt-auto pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/library">
                  <HugeiconsIcon
                    icon={Book02Icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                  <span>Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/assets">
                  <HugeiconsIcon
                    icon={Image01Icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                  <span>Assets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/trash">
                  <HugeiconsIcon
                    icon={Delete01Icon}
                    size={16}
                    strokeWidth={1.5}
                  />
                  <span>Trash</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                if (defaultPersonalSpace) {
                  handleCreateNote(defaultPersonalSpace.id);
                }
              }}
              className="justify-center bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
            >
              <HugeiconsIcon
                icon={PencilEdit01Icon}
                size={16}
                strokeWidth={1.5}
              />
              <span className="text-sm font-medium">Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />

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
    </Sidebar>
  );
}
