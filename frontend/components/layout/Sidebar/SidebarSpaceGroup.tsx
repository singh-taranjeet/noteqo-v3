"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface SidebarSpaceGroupProps {
  name: string;
  children: ReactNode;
  defaultOpen?: boolean;
  onCreateNote?: () => void;
}

export function SidebarSpaceGroup({
  name,
  children,
  defaultOpen = true,
  onCreateNote,
}: SidebarSpaceGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-1">
      <div className="flex items-center group">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex flex-1 items-center justify-start gap-1.5 px-5 h-7"
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={10}
              strokeWidth={2}
              className={cn(
                "text-muted-foreground transition-transform duration-200 opacity-0 group-hover:opacity-100",
                isOpen && "rotate-90",
              )}
            />
            <span className="text-sm font-normal text-foreground truncate">
              📁 {name}
            </span>
          </Button>
        </CollapsibleTrigger>

        {onCreateNote && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 mr-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={onCreateNote}
            aria-label={`Create note in ${name}`}
          >
            <HugeiconsIcon
              icon={Add01Icon}
              size={14}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          </Button>
        )}
      </div>

      <CollapsibleContent className="flex flex-col pl-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
