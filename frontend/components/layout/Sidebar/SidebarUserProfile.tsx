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
              aria-label="Close sidebar"
            >
              <HugeiconsIcon
                icon={ArrowLeft02Icon}
                size={16}
                strokeWidth={1.5}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Close sidebar</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
