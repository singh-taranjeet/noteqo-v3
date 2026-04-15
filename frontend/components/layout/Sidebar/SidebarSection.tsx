'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface SidebarSectionProps {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function SidebarSection({ label, children, defaultOpen = true }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-1 px-3 h-6 group"
        >
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={12}
            strokeWidth={2}
            className={cn(
              'text-muted-foreground transition-transform duration-200 opacity-0 group-hover:opacity-100',
              isOpen && 'rotate-90',
            )}
          />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
