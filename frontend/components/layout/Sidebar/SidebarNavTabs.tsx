import {
  Home01Icon,
  BubbleChatIcon,
  GridTableIcon,
  InboxIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavTab {
  id: string;
  icon: typeof Home01Icon;
  label: string;
  badge?: number;
}

const NAV_TABS: NavTab[] = [
  { id: 'home', icon: Home01Icon, label: 'Home' },
  { id: 'chat', icon: BubbleChatIcon, label: 'Chat' },
  { id: 'grid', icon: GridTableIcon, label: 'Grid' },
  { id: 'inbox', icon: InboxIcon, label: 'Inbox', badge: 3 },
  { id: 'search', icon: Search01Icon, label: 'Search' },
];

interface SidebarNavTabsProps {
  activeTab?: string;
}

export function SidebarNavTabs({ activeTab = 'home' }: SidebarNavTabsProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-1">
      {NAV_TABS.map((tab) => (
        <Tooltip key={tab.id}>
          <TooltipTrigger asChild>
            <Button
              variant={activeTab === tab.id ? 'secondary' : 'ghost'}
              size="icon"
              className="relative h-7 w-7"
              aria-label={tab.label}
            >
              <HugeiconsIcon icon={tab.icon} size={18} strokeWidth={1.5} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 text-[9px] font-bold justify-center"
                >
                  {tab.badge}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{tab.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
