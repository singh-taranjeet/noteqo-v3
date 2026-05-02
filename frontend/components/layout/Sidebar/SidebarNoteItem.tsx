"use client";

import Link from "next/link";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";

interface SidebarNoteItemProps {
  noteId: string;
  emoji: string;
  title: string;
  /** The sidebar menu button size. Defaults to "sm". */
  size?: "sm" | "default" | "lg";
}

/**
 * Reusable sidebar note row: emoji + title wrapped in a Link.
 * Used in RecentSection, SidebarSpaceCategory, and SecondarySidebar.
 */
export function SidebarNoteItem({
  noteId,
  emoji,
  title,
  size = "sm",
}: Readonly<SidebarNoteItemProps>) {
  return (
    <SidebarMenuButton asChild size={size}>
      <Link href={ROUTES.NOTE(noteId)}>
        <span className="shrink-0 text-base" role="img" aria-hidden="true">
          {emoji}
        </span>
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  );
}
