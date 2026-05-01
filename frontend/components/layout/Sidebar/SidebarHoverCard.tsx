"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SidebarHoverCardProps {
  trigger: ReactNode;
  title?: string;
  children: ReactNode;
  sideOffset?: number;
  className?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

export function SidebarHoverCard({
  trigger,
  title,
  children,
  sideOffset = 16,
  className,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
}: Readonly<SidebarHoverCardProps>) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={sideOffset}
        className={cn(
          "w-64 p-0 shadow-xl overflow-hidden flex flex-col h-[60vh] min-h-[400px] max-h-[calc(100vh-2rem)] bg-glass border-white/10",
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-3 border-b border-border/50 shrink-0">
            <span className="text-sm font-semibold">{title}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto relative">
          {onSearchChange && (
            <div className="sticky top-0 z-10 p-3 bg-glass border-b border-border/50 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={searchQuery ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-8 h-8 text-xs bg-background/50 focus-visible:ring-1 focus-visible:bg-background"
                />
              </div>
            </div>
          )}
          <div className="p-2">{children}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
