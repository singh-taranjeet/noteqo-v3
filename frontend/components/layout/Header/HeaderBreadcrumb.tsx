"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { useParams } from "next/navigation";
import { useSpaces } from "@/features/spaces";
import { useRemoteNotes } from "@/features/workspace";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Folder01Icon, File01Icon } from "@hugeicons/core-free-icons";
import { ROUTES } from "@/constants/routes";

interface BreadcrumbEntry {
  emoji: string;
  label: string;
}

interface HeaderBreadcrumbProps {
  items?: BreadcrumbEntry[];
}

export function HeaderBreadcrumb({ items }: HeaderBreadcrumbProps) {
  const params = useParams();
  const noteId = params?.note_id as string | undefined;

  const { data: spaces = [] } = useSpaces();
  const { data: spaceNotesMap = {} } = useRemoteNotes(spaces.length > 0 ? spaces : undefined);

  // If items are passed explicitly, use them (for fallback/static routes)
  if (items && items.length > 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-1 text-sm cursor-pointer">
                  <span role="img" aria-hidden="true" className="shrink-0">
                    {item.emoji}
                  </span>
                  <span className="truncate">{item.label}</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Find the note and its corresponding space
  let activeSpace = null;
  let activeNote = null;

  if (noteId) {
    for (const space of spaces) {
      const notes = spaceNotesMap[space.id] || [];
      const note = notes.find(n => n.id === noteId);
      if (note) {
        activeSpace = space;
        activeNote = note;
        break;
      }
    }
  }

  // Default Home view when no note is selected
  if (!activeSpace || !activeNote) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Link href={ROUTES.NOTES}>
                <HugeiconsIcon icon={Home01Icon} size={14} strokeWidth={2} />
                <span className="truncate">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild className="flex items-center gap-1.5 text-sm cursor-pointer">
            <Link href={ROUTES.NOTES}>
              <HugeiconsIcon icon={Folder01Icon} size={14} strokeWidth={2} />
              <span className="truncate">{activeSpace.name}</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-1.5 text-sm font-medium">
            {activeNote.emoji ? (
              <span role="img" aria-hidden="true" className="shrink-0 text-[14px]">
                {activeNote.emoji}
              </span>
            ) : (
              <HugeiconsIcon icon={File01Icon} size={14} strokeWidth={2} className="text-muted-foreground" />
            )}
            <span className="truncate">{activeNote.title || "Untitled"}</span>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
