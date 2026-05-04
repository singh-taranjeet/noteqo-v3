"use client";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";

import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
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
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { Button } from "@/components/ui/button";

interface SidebarUserProfileProps {
  username: string;
  avatarEmoji?: string;
  isLoading?: boolean;
}

export function SidebarUserProfile({
  username,
  avatarEmoji = "😎",
  isLoading,
}: SidebarUserProfileProps) {
  const { logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuSkeleton
            showIcon
            className="h-12 w-full px-4 rounded-lg"
          />
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent border data-[state=open]:text-sidebar-accent-foreground justify-between"
                id="sidebar-user-profile-trigger"
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <span
                    className="text-base shrink-0"
                    role="img"
                    aria-label="User avatar"
                  >
                    {avatarEmoji}
                  </span>
                  <span className="text-sm font-medium truncate text-left">
                    {username}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp
                    size={14}
                    strokeWidth={1.5}
                    className="opacity-50 shrink-0"
                  />
                ) : (
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    className="opacity-50 shrink-0"
                  />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="start" className="w-56">
              <DropdownMenuLabel>{username}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsLogoutDialogOpen(true)}
                id="sidebar-logout-button"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <DynamicDialog
        title="Log Out"
        description="Would you like to keep your Master Key on this device for easier login next time?"
        isOpen={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <div className="flex flex-col gap-3 pt-4">
          <Button
            variant="default"
            onClick={() => {
              setIsLogoutDialogOpen(false);
              logout(false);
            }}
          >
            Keep Master Key (Easier login)
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setIsLogoutDialogOpen(false);
              logout(true);
            }}
          >
            Delete Master Key (More secure)
          </Button>
        </div>
      </DynamicDialog>
    </>
  );
}
