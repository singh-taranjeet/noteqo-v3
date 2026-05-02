"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Logout02Icon } from "@hugeicons/core-free-icons";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
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
}

export function SidebarUserProfile({
  username,
  avatarEmoji = "😎",
}: SidebarUserProfileProps) {
  const { logout } = useLogout();
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="start"
            className="w-56"
          >
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
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
