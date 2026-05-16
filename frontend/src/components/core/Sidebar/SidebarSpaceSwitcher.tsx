import { ChevronsUpDown, Plus, Layers } from "lucide-react";

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
import { useSpaces, useActiveSpace, SPACE_TYPE } from "@/features/spaces";
import type { Space } from "@/features/spaces";

interface SidebarSpaceSwitcherProps {
  onAddSpaceClick: (type: "personal" | "shared") => void;
}

export function SidebarSpaceSwitcher({
  onAddSpaceClick,
}: SidebarSpaceSwitcherProps) {
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
            {personalSpaces.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Personal
                </DropdownMenuLabel>
                {personalSpaces.map((space) => (
                  <DropdownMenuItem
                    key={space.id}
                    onClick={() => setActiveSpaceId(space.id)}
                    className={`gap-2 p-2 ${activeSpaceId === space.id ? "bg-accent/50" : ""}`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border text-xs font-semibold">
                      {getSpaceIcon(space)}
                    </div>
                    <span className="truncate">{space.name}</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {/* Shared Spaces */}
            {sharedSpaces.length > 0 && (
              <>
                {personalSpaces.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Shared
                </DropdownMenuLabel>
                {sharedSpaces.map((space) => (
                  <DropdownMenuItem
                    key={space.id}
                    onClick={() => setActiveSpaceId(space.id)}
                    className={`gap-2 p-2 ${activeSpaceId === space.id ? "bg-accent/50" : ""}`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border text-xs font-semibold">
                      {getSpaceIcon(space)}
                    </div>
                    <span className="truncate">{space.name}</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => onAddSpaceClick(SPACE_TYPE.PERSONAL)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus size={14} />
              </div>
              <span className="text-muted-foreground font-medium">
                Create Space
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
