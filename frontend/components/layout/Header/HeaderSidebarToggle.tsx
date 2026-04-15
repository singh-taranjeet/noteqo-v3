'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import { useAppShell } from '../AppShell';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function HeaderSidebarToggle() {
  const { isSidebarOpen, toggleSidebar } = useAppShell();

  if (isSidebarOpen) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7"
          aria-label="Open sidebar"
        >
          <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={1.5} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Open sidebar</TooltipContent>
    </Tooltip>
  );
}
