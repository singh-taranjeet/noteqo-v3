"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ROUTES } from "@/constants/routes";
import type { NoteTreeNode } from "@/features/workspace/types/workspace.types";

interface SidebarNoteTreeItemProps {
  note: NoteTreeNode;
  activeNoteId?: string;
}

export function SidebarNoteTreeItem({
  note,
  activeNoteId,
}: Readonly<SidebarNoteTreeItemProps>) {
  const hasChildren = note.children && note.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);
  const isActive = activeNoteId === note.id;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuSubItem>
          <div className="flex items-center w-full relative">
            <CollapsibleTrigger asChild>
              <button
                className="absolute left-0 w-6 h-6 flex items-center justify-center z-10 hover:bg-sidebar-accent rounded-sm text-sidebar-foreground"
                aria-label="Toggle children"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={10}
                  strokeWidth={2}
                  className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                />
              </button>
            </CollapsibleTrigger>
            <SidebarMenuSubButton
              asChild
              isActive={isActive}
              className="pl-6 w-full"
            >
              <Link href={ROUTES.NOTE(note.id)}>
                <span
                  className="shrink-0 text-base"
                  role="img"
                  aria-hidden="true"
                >
                  {note.emoji}
                </span>
                <span className="text-base font-medium">{note.title || "Untitled"}</span>
              </Link>
            </SidebarMenuSubButton>
          </div>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-0">
              {note.children.map((child) => (
                <SidebarNoteTreeItem
                  key={child.id}
                  note={child}
                  activeNoteId={activeNoteId}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuSubItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive} className="pl-6 w-full">
        <Link href={ROUTES.NOTE(note.id)}>
          <span className="shrink-0 text-base" role="img" aria-hidden="true">
            {note.emoji}
          </span>
          <span className="text-base font-medium">{note.title || "Untitled"}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
