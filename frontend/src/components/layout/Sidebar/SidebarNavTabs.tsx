import { Home, Search } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { ActiveTabType } from "../types";
import { SearchDialog } from "./Search";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface SidebarNavTabsProps {
  activeTab?: ActiveTabType;
  setActiveTab: (activeTab: ActiveTabType) => void;
}

export function SidebarNavTabs({
  activeTab = "home",
  setActiveTab,
}: Readonly<SidebarNavTabsProps>) {
  const navigate = useNavigate();

  return (
    <SidebarMenu className="flex-row gap-2 px-2 flex-wrap">
      <SidebarMenuItem className="flex-[1_1_45%]">
        <SidebarMenuButton
          isActive={activeTab === "home"}
          onClick={() => {
            setActiveTab("home");
            navigate(ROUTES.NOTES);
          }}
          tooltip="Notes"
          className="justify-center"
        >
          <Home size={18} strokeWidth={1.5} />
          <span className="text-sm ">Notes</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem className="flex-[1_1_45%]">
        <SearchDialog
          trigger={
            <SidebarMenuButton
              isActive={activeTab === "search"}
              tooltip="Search"
              className="justify-center"
            >
              <Search size={18} strokeWidth={1.5} />
              <span className="text-sm ">Search</span>
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
