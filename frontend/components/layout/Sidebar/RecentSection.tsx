"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { SidebarNoteItem } from "./SidebarNoteItem";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppShell } from "../AppShell";
import { useRecentNotes } from "@/features/workspace";

export function RecentSection() {
  const { notes, isLoading } = useRecentNotes();
  const { openSecondarySidebar } = useAppShell();
  const [isOpen, setIsOpen] = useState(true);

  const recentNotes = notes.slice(0, 10);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group/collapsible"
    >
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="cursor-pointer">
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              strokeWidth={2}
              className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
            />
            <span className="text-base font-medium">Recent</span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            {isLoading && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              </SidebarMenu>
            )}
            {!isLoading && recentNotes.length === 0 && (
              <div className="px-3 py-1.5 text-xs text-muted-foreground">
                No recent notes
              </div>
            )}
            {!isLoading && recentNotes.length > 0 && (
              <SidebarMenu>
                {recentNotes.map((note) => (
                  <SidebarMenuItem key={note.id}>
                    <SidebarNoteItem
                      noteId={note.id}
                      emoji={note.emoji}
                      title={note.title}
                    />
                  </SidebarMenuItem>
                ))}
                {notes.length > 10 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => openSecondarySidebar("recent")}
                    >
                      More
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
