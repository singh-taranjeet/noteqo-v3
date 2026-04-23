import { Home01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActiveTabType } from "../types";

interface SidebarNavTabsProps {
  activeTab?: ActiveTabType;
  setActiveTab: (activeTab: ActiveTabType) => void;
}

export function SidebarNavTabs({
  activeTab = "home",
  setActiveTab,
}: Readonly<SidebarNavTabsProps>) {
  return (
    <div className="">
      <div className="flex px-2 gap-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTab === "home" ? "secondary" : "ghost"}
              size="sm"
              className="flex gap-2 px-2"
              aria-label={"home"}
              onClick={() => setActiveTab("home")}
            >
              <HugeiconsIcon icon={Home01Icon} size={18} strokeWidth={1.5} />
              {activeTab === "home" ? <p>{"home"}</p> : undefined}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{"home"}</TooltipContent>
        </Tooltip>
        {/* Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTab === "search" ? "secondary" : "ghost"}
              size="sm"
              className="flex gap-5"
              aria-label={"search"}
              onClick={() => setActiveTab("search")}
            >
              <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.5} />
              {activeTab === "search" ? <p>{"search"}</p> : undefined}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{"search"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
