"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon, Logout02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/features/auth";
import { useAppShell } from "../AppShell";

interface SidebarUserProfileProps {
  username: string;
  avatarEmoji?: string;
  onCloseSidebar?: () => void;
}

export function SidebarUserProfile({
  username,
  avatarEmoji = "😎",
  onCloseSidebar,
}: SidebarUserProfileProps) {
  const { logout } = useLogout();
  const { isSidebarOpen } = useAppShell();

  return (
    <div className="flex items-center justify-between px-3 py-2 group">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex cursor-pointer items-center gap-2 min-w-0 rounded-lg px-1.5 py-1 -ml-1.5 hover:bg-sidebar-accent transition-colors outline-none"
            id="sidebar-user-profile-trigger"
          >
            <span
              className="text-lg shrink-0"
              role="img"
              aria-label="User avatar"
            >
              {avatarEmoji}
            </span>
            <span className="text-sm font-medium truncate">{username}</span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="start" className="w-56">
          <DropdownMenuLabel>{username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={logout}
            id="sidebar-logout-button"
          >
            <HugeiconsIcon icon={Logout02Icon} size={16} strokeWidth={1.5} />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {onCloseSidebar && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseSidebar}
              className="h-6 w-6 shrink-0"
              aria-label={isSidebarOpen ? "Close sidebar" : "Lock sidebar open"}
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={16}
                strokeWidth={1.5}
                className={isSidebarOpen ? "" : "rotate-180"}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span className="flex items-center gap-2">
              {isSidebarOpen ? "Close sidebar" : "Lock sidebar open"}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>\
              </kbd>
            </span>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
