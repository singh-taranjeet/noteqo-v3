import { BookOpen, Image as ImageIcon, PenLine, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarNavTabs } from "./SidebarNavTabs";
import { SidebarSpaceCategory } from "./SidebarSpaceCategory";
import { RecentSection } from "./RecentSection";
import { SidebarThemeToggle } from "./SidebarThemeToggle";
import { SpaceSettingsDialog } from "@/features/spaces/components/SpaceSettingsDialog/SpaceSettingsDialog";
import { useSpaces, useCreateSpace } from "@/features/spaces";
import { useCreateNote } from "@/features/workspace";
import { MOCK_USER, useUserProfile } from "@/features/auth";
import { SPACE_TYPE } from "@/features/spaces";
import type { Space, SpaceType } from "@/features/spaces";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";
import type { ActiveTabType } from "../types";
import { Link } from "react-router-dom";
import { useRemoteSpaces } from "@/features/spaces/hooks/useRemoteSpace";

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
  const { pathname } = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [pathname, isMobile, setOpenMobile]);

  const { data, isLoading: spacesLoading, spaceNoteTreesMap } = useSpaces();
  useRemoteSpaces();

  const { spaces = [] } = data || {};

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
          label="Shared space"
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
          label="Private space"
          spaces={personalSpaces}
          isLoading={isLoading}
          emptyMessage="No spaces yet"
          spaceNoteTreesMap={spaceNoteTreesMap}
          onAddSpaceClick={() => setCreateSpaceType(SPACE_TYPE.PERSONAL)}
          addSpaceTooltip="Create private space"
          onCreateNote={handleCreateNote}
          onSettingsClick={(space) => setSettingsSpace(space)}
        />

        {/* Utilities Section */}
        <SidebarGroup className="mt-auto pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/library">
                  <BookOpen size={16} strokeWidth={1.5} />
                  <span>Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/assets">
                  <ImageIcon size={16} strokeWidth={1.5} />
                  <span>Assets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/trash">
                  <Trash2 size={16} strokeWidth={1.5} />
                  <span>Trash</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarThemeToggle />
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
              <PenLine size={16} strokeWidth={1.5} />
              <span className="text-sm ">Quick Create</span>
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

      <SpaceSettingsDialog
        space={settingsSpace}
        isOpen={settingsSpace !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSettingsSpace(null);
        }}
      />
    </Sidebar>
  );
}
