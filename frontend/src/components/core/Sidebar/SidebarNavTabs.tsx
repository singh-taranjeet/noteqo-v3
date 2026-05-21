import { Home, Search } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { ActiveTabType } from "../types";
import { SearchDialog } from "./Search";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

interface SidebarNavTabsProps {
  activeTab?: ActiveTabType;
}

export function SidebarNavTabs({
  activeTab = "",
}: Readonly<SidebarNavTabsProps>) {
  return (
    <SidebarMenu className="gap-1">
      <SidebarMenuItem>
        <SearchDialog
          trigger={
            <SidebarMenuButton
              isActive={activeTab === "search"}
              tooltip="Search"
            >
              <Search size={18} strokeWidth={1.5} />
              <span className="text-sm">Search</span>
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={activeTab === "home"}
          tooltip="Home"
        >
          <Link to={ROUTES.NOTES}>
            <Home size={18} strokeWidth={1.5} />
            <span className="text-sm">Home</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
