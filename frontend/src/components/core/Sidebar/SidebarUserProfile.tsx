import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";

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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLogout } from "@/features/auth";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface SidebarUserProfileProps {
  username: string;
  email?: string;
  avatarEmoji?: string;
  isLoading?: boolean;
}

export function SidebarUserProfile({
  username,
  email,
  avatarEmoji = "😎",
  isLoading,
}: SidebarUserProfileProps) {
  const { logout } = useLogout();
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                tooltip="Account"
                id="sidebar-user-profile-trigger"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-sm">
                    {avatarEmoji}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{username}</span>
                  {email && (
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4 opacity-50" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="top"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-sm">
                      {avatarEmoji}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{username}</span>
                    {email && (
                      <span className="truncate text-xs text-muted-foreground">
                        {email}
                      </span>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.SETTINGS}>
                    <Settings size={16} strokeWidth={1.5} />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={ROUTES.PROFILE}>
                    <User size={16} strokeWidth={1.5} />
                    Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
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
