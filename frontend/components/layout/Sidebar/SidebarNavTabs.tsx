"use client";
import { Home, Search } from "lucide-react";

import { useState } from "react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { ActiveTabType } from "../types";
import { SearchSheet } from "./Search";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

interface SidebarNavTabsProps {
  activeTab?: ActiveTabType;
  setActiveTab: (activeTab: ActiveTabType) => void;
}

export function SidebarNavTabs({
  activeTab = "home",
  setActiveTab,
}: Readonly<SidebarNavTabsProps>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <SidebarMenu className="flex-row gap-2 px-2 flex-wrap">
        <SidebarMenuItem className="flex-[1_1_45%]">
          <SidebarMenuButton
            isActive={activeTab === "home"}
            onClick={() => {
              setActiveTab("home");
              router.push(ROUTES.NOTES);
            }}
            tooltip="Notes"
            className="justify-center"
          >
            <Home size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Notes</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem className="flex-[1_1_45%]">
          <SidebarMenuButton
            onClick={() => setIsSearchOpen(true)}
            isActive={activeTab === "search"}
            tooltip="Search"
            className="justify-center"
          >
            <Search size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SearchSheet open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
