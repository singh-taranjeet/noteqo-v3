"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface SidebarSectionProps {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
}

export function SidebarSection({
  label,
  children,
  defaultOpen = true,
  action,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <div className="flex w-full items-center justify-between group px-3 h-6">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex flex-1 items-center justify-start gap-1 p-0 h-full hover:bg-transparent"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              strokeWidth={2}
              className={cn(
                "text-muted-foreground transition-transform duration-200 opacity-0 group-hover:opacity-100",
                isOpen && "rotate-90",
              )}
            />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
          </Button>
        </CollapsibleTrigger>
        {action && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0">
            {action}
          </div>
        )}
      </div>
      <CollapsibleContent className="flex flex-col mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
