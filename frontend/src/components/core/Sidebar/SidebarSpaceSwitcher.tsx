import { ChevronsUpDown, Plus, Layers, Settings2 } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSpaces, useActiveSpace, SPACE_TYPE } from "@/features/spaces";
import type { Space } from "@/features/spaces";

interface SidebarSpaceSwitcherProps {
  onAddSpaceClick: (type: "personal" | "shared") => void;
}

import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

export function SidebarSpaceSwitcher({
  onAddSpaceClick,
}: SidebarSpaceSwitcherProps) {
  const navigate = useNavigate();
  const { data } = useSpaces();
  const { spaces = [] } = data || {};
  const { activeSpaceId, activeSpace, setActiveSpaceId } = useActiveSpace();

  const personalSpaces = spaces.filter((s) => s.type === SPACE_TYPE.PERSONAL);
  const sharedSpaces = spaces.filter((s) => s.type === SPACE_TYPE.SHARED);

  const getSpaceIcon = (space: Space) => {
    const initial = space.name.charAt(0).toUpperCase();
    return initial;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip="Switch Space"
              id="sidebar-space-switcher-trigger"
            >
              {activeSpace ? (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
                    {getSpaceIcon(activeSpace)}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {activeSpace.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {activeSpace.type}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Layers size={16} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">All Spaces</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Showing all notes
                    </span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {/* All Spaces option */}
            <DropdownMenuItem
              onClick={() => setActiveSpaceId(null)}
              className={`gap-2 p-2 ${!activeSpaceId ? "bg-accent/50" : ""}`}
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <Layers size={14} className="shrink-0" />
              </div>
              All Spaces
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Personal Spaces */}
            <DropdownMenuLabel className="flex items-center justify-between text-xs text-muted-foreground">
              Personal
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    className="hover:bg-accent hover:text-accent-foreground p-0.5 rounded-sm cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSpaceClick(SPACE_TYPE.PERSONAL);
                    }}
                  >
                    <Plus size={12} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Create Personal Space
                </TooltipContent>
              </Tooltip>
            </DropdownMenuLabel>
            {personalSpaces.map((space) => (
              <DropdownMenuItem
                key={space.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest(".manage-space-btn")) {
                    navigate(ROUTES.SPACE(space.id));
                  } else {
                    setActiveSpaceId(space.id);
                  }
                }}
                className={`gap-2 p-2 group ${activeSpaceId === space.id ? "bg-accent/50" : ""}`}
              >
                <div className="flex size-6 items-center justify-center rounded-md border text-xs font-semibold">
                  {getSpaceIcon(space)}
                </div>
                <span className="truncate flex-1">{space.name}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="manage-space-btn p-1 hover:bg-accent rounded-sm text-muted-foreground hover:text-foreground cursor-pointer">
                      <Settings2 size={14} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">Manage Space</TooltipContent>
                </Tooltip>
              </DropdownMenuItem>
            ))}
            {personalSpaces.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                No personal spaces
              </div>
            )}

            <DropdownMenuSeparator />

            {/* Shared Spaces */}
            <DropdownMenuLabel className="flex items-center justify-between text-xs text-muted-foreground">
              Shared
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    className="hover:bg-accent hover:text-accent-foreground p-0.5 rounded-sm cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSpaceClick(SPACE_TYPE.SHARED);
                    }}
                  >
                    <Plus size={12} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Create Shared Space
                </TooltipContent>
              </Tooltip>
            </DropdownMenuLabel>
            {sharedSpaces.map((space) => (
              <DropdownMenuItem
                key={space.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest(".manage-space-btn")) {
                    navigate(ROUTES.SPACE(space.id));
                  } else {
                    setActiveSpaceId(space.id);
                  }
                }}
                className={`gap-2 p-2 group ${activeSpaceId === space.id ? "bg-accent/50" : ""}`}
              >
                <div className="flex size-6 items-center justify-center rounded-md border text-xs font-semibold">
                  {getSpaceIcon(space)}
                </div>
                <span className="truncate flex-1">{space.name}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="manage-space-btn p-1 hover:bg-accent rounded-sm text-muted-foreground hover:text-foreground cursor-pointer">
                      <Settings2 size={14} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">Manage Space</TooltipContent>
                </Tooltip>
              </DropdownMenuItem>
            ))}
            {sharedSpaces.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                No shared spaces
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
