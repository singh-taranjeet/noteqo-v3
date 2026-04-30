"use client";

import { useState } from "react";
import { Home01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { ActiveTabType } from "../types";
import { SearchSheet } from "./Search";

interface SidebarNavTabsProps {
  activeTab?: ActiveTabType;
  setActiveTab: (activeTab: ActiveTabType) => void;
}

export function SidebarNavTabs({
  activeTab = "home",
  setActiveTab,
}: Readonly<SidebarNavTabsProps>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={activeTab === "home"}
            onClick={() => setActiveTab("home")}
            tooltip="Home"
          >
            <HugeiconsIcon icon={Home01Icon} size={18} strokeWidth={1.5} />
            <span>Home</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setIsSearchOpen(true)}
            isActive={activeTab === "search"}
            tooltip="Search"
          >
            <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.5} />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SearchSheet open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
