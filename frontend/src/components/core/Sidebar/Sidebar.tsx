import {
  BookOpen,
  ChevronRight,
  Clock,
  Home,
  Image as ImageIcon,
  PenLine,
  Search,
  Trash2,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarSpaceSwitcher } from "./SidebarSpaceSwitcher";
import { SidebarNotesList } from "./SidebarNotesList";
import { RecentSubMenu } from "./RecentSection";
import { SearchDialog } from "./Search";
import { SpaceSettingsDialog } from "@/features/spaces";
import { useSpaces, useCreateSpace, useActiveSpace } from "@/features/spaces";
import { useCreateNote } from "@/features/workspace";
import { MOCK_USER, useUserProfile } from "@/features/auth";
import { SPACE_TYPE } from "@/features/spaces";
import type { Space, SpaceType } from "@/features/spaces";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";
import type { ActiveTabType } from "../types";
import { useRemoteSpaces } from "@/features/spaces";
import { ROUTES } from "@/constants/routes.constants";

const ACTIVE_TAB_MAP: Record<string, ActiveTabType> = {
  "/notes": "home",
  "/library": "library",
  "/assets": "assets",
  "/trash": "trash",
};

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

  const { data } = useSpaces();
  useRemoteSpaces();

  const { spaces = [] } = data || {};

  const { mutate: createNote } = useCreateNote();
  const { createSpace, isLoading: isCreatingSpace } = useCreateSpace();
  const { activeSpaceId } = useActiveSpace();

  // Track which type of space is being created to show the correct dialog
  const [createSpaceType, setCreateSpaceType] = useState<SpaceType | null>(
    null,
  );

  // Track which space we are managing settings for
  const [settingsSpace, setSettingsSpace] = useState<Space | null>(null);

  const activeTab = useMemo<ActiveTabType>(() => {
    const match = Object.entries(ACTIVE_TAB_MAP).find(([prefix]) =>
      pathname.startsWith(prefix),
    );
    return match ? match[1] : "";
  }, [pathname]);

  const defaultPersonalSpace = spaces.find(
    (personalSpace) =>
      personalSpace.type === SPACE_TYPE.PERSONAL && personalSpace.isDefault,
  );

  const { data: userProfile, isLoading: isUserProfileLoading } =
    useUserProfile();

  const handleQuickCreate = () => {
    // If a space is selected, create in that space
    // If "All Spaces", create in default personal space
    const targetSpaceId = activeSpaceId || defaultPersonalSpace?.id;
    if (targetSpaceId) {
      createNote({ spaceId: targetSpaceId });
    }
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
        <SidebarSpaceSwitcher
          onAddSpaceClick={(type) => setCreateSpaceType(type)}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* Search */}
            <SidebarMenuItem>
              <SearchDialog
                trigger={
                  <SidebarMenuButton tooltip="Search">
                    <Search size={16} strokeWidth={1.5} />
                    <span>Search</span>
                  </SidebarMenuButton>
                }
              />
            </SidebarMenuItem>

            {/* Home */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "home"}
                className="font-medium"
                tooltip="Home"
              >
                <Link to={ROUTES.NOTES}>
                  <Home size={16} strokeWidth={1.5} />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Recent notes */}
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="font-medium cursor-pointer"
                    tooltip="Recent"
                  >
                    <Clock size={16} strokeWidth={1.5} />
                    <span>Recent</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight size={14} />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">Toggle</TooltipContent>
                </Tooltip>
                <CollapsibleContent>
                  <RecentSubMenu />
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            {/* Notes — space-scoped */}
            <SidebarNotesList />
          </SidebarMenu>
        </SidebarGroup>

        {/* Utilities Section at bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "library"}
                className="font-medium"
                tooltip="Library"
              >
                <Link to={ROUTES.LIBRARY}>
                  <BookOpen size={16} strokeWidth={1.5} />
                  <span>Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "assets"}
                className="font-medium"
                tooltip="Assets"
              >
                <Link to={ROUTES.ASSETS}>
                  <ImageIcon size={16} strokeWidth={1.5} />
                  <span>Assets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "trash"}
                className="font-medium"
                tooltip="Trash"
              >
                <Link to={ROUTES.TRASH}>
                  <Trash2 size={16} strokeWidth={1.5} />
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
              onClick={handleQuickCreate}
              className="justify-center bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
              tooltip="Quick Create Note"
            >
              <PenLine size={16} strokeWidth={1.5} />
              <span className="text-sm">Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarUserProfile
          username={userProfile?.name || MOCK_USER.NAME}
          email={userProfile?.email}
          avatarEmoji={
            userProfile?.name
              ? userProfile.name.charAt(0).toUpperCase()
              : MOCK_USER.AVATAR
          }
          isLoading={isUserProfileLoading}
        />
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

      {settingsSpace ? (
        <SpaceSettingsDialog
          space={settingsSpace}
          isOpen={settingsSpace !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSettingsSpace(null);
          }}
        />
      ) : null}
    </Sidebar>
  );
}
