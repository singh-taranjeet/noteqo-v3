import { FileText, Folder, MoreHorizontal } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSpaces } from "@/features/spaces";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Note } from "@/features/workspace/types/workspace.types";

interface BreadcrumbEntry {
  emoji: string;
  label: string;
}

interface HeaderBreadcrumbProps {
  items?: BreadcrumbEntry[];
}

export function HeaderBreadcrumb({ items }: HeaderBreadcrumbProps) {
  const params = useParams();
  const navigate = useNavigate();
  const noteId = params?.note_id as string | undefined;

  const { data, spaceNotesMap } = useSpaces();
  const { spaces = [] } = data || {};

  // If items are passed explicitly, use them (for fallback/static routes)
  if (items && items.length > 0) {
    return (
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {items.map((item, index) => (
            <React.Fragment key={item.label}>
              {index > 0 && <BreadcrumbSeparator className="shrink-0" />}
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbLink className="flex items-center gap-1 text-sm cursor-pointer whitespace-nowrap">
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
  const notePath: Note[] = [];
  let allSpaceNotes: Note[] = [];

  if (noteId) {
    for (const space of spaces) {
      const notes = spaceNotesMap[space.id] || [];
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        activeSpace = space;
        activeNote = note;
        allSpaceNotes = notes;

        let current: Note | undefined = note;
        while (current) {
          notePath.unshift(current);
          const nextParentId: string | undefined = current.parentId;
          current = nextParentId
            ? notes.find((n) => n.id === nextParentId)
            : undefined;
        }
        break;
      }
    }
  }

  // Default Home view when no note is selected
  if (!activeSpace || !activeNote) {
    return null;
  }

  const getSiblingNotes = (note: Note) => {
    return allSpaceNotes.filter((n) => n.parentId === note.parentId);
  };

  const renderNoteDropdown = (note: Note, isLast: boolean = false) => {
    const siblings = getSiblingNotes(note);
    if (
      siblings.length === 0 ||
      (siblings.length === 1 && siblings[0].id === note.id)
    ) {
      return renderNoteLink(note, isLast);
    }

    const NoteTriggerContent = () => (
      <>
        {note.emoji ? (
          <span role="img" aria-hidden="true" className="shrink-0 text-sm">
            {note.emoji}
          </span>
        ) : (
          <FileText
            size={14}
            strokeWidth={2}
            className="text-muted-foreground"
          />
        )}
        <span className="truncate">{note.title || "Untitled"}</span>
      </>
    );

    return (
      <HoverCard openDelay={200} closeDelay={200}>
        <HoverCardTrigger asChild>
          {isLast ? (
            <BreadcrumbPage className="flex items-center gap-1.5 text-sm  hover:bg-accent hover:text-accent-foreground px-1.5 py-0.5 rounded-md cursor-pointer whitespace-nowrap focus:outline-none focus:ring-0">
              <NoteTriggerContent />
            </BreadcrumbPage>
          ) : (
            <button
              className="flex items-center gap-1.5 text-sm hover:bg-accent hover:text-accent-foreground px-1.5 py-0.5 rounded-md cursor-pointer whitespace-nowrap focus:outline-none focus:ring-0"
              onClick={() => navigate(ROUTES.NOTE(note.id))}
            >
              <NoteTriggerContent />
            </button>
          )}
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="max-h-80 overflow-y-auto w-64 p-1 flex flex-col gap-0.5"
        >
          {siblings.map((sibling) => (
            <button
              key={sibling.id}
              onClick={() => {
                navigate(ROUTES.NOTE(sibling.id));
              }}
              className={`flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors ${
                sibling.id === note.id
                  ? "bg-accent/50 text-accent-foreground "
                  : ""
              }`}
            >
              {sibling.emoji ? (
                <span className="mr-2 shrink-0">{sibling.emoji}</span>
              ) : (
                <FileText
                  size={14}
                  className="mr-2 shrink-0 text-muted-foreground"
                />
              )}
              <span className="truncate">{sibling.title || "Untitled"}</span>
            </button>
          ))}
        </HoverCardContent>
      </HoverCard>
    );
  };

  const renderNoteLink = (note: Note, isLast: boolean = false) => {
    if (isLast) {
      return (
        <BreadcrumbPage className="flex items-center gap-1.5 text-sm  whitespace-nowrap px-1.5 py-0.5">
          {note.emoji ? (
            <span role="img" aria-hidden="true" className="shrink-0 text-sm">
              {note.emoji}
            </span>
          ) : (
            <FileText
              size={14}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          )}
          <span className="truncate">{note.title || "Untitled"}</span>
        </BreadcrumbPage>
      );
    }

    return (
      <BreadcrumbLink
        asChild
        className="flex items-center gap-1.5 text-sm cursor-pointer whitespace-nowrap px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground rounded-md"
      >
        <Link to={ROUTES.NOTE(note.id)}>
          {note.emoji ? (
            <span role="img" aria-hidden="true" className="shrink-0 text-sm">
              {note.emoji}
            </span>
          ) : (
            <FileText
              size={14}
              strokeWidth={2}
              className="text-muted-foreground"
            />
          )}
          <span className="truncate">{note.title || "Untitled"}</span>
        </Link>
      </BreadcrumbLink>
    );
  };

  let renderedPath: React.ReactNode[] = [];

  if (notePath.length <= 2) {
    renderedPath = notePath.map((n, i) => {
      const isLast = i === notePath.length - 1;
      return (
        <React.Fragment key={n.id}>
          <BreadcrumbSeparator className="shrink-0" />
          <BreadcrumbItem className="shrink-0">
            {renderNoteDropdown(n, isLast)}
          </BreadcrumbItem>
        </React.Fragment>
      );
    });
  } else {
    // Render last 2 nodes of notePath + ellipsis
    const pParent = notePath[notePath.length - 2];
    const current = notePath[notePath.length - 1];

    renderedPath = [
      <React.Fragment key="ellipsis">
        <BreadcrumbSeparator className="shrink-0" />
        <BreadcrumbItem className="shrink-0">
          <HoverCard openDelay={200} closeDelay={200}>
            <HoverCardTrigger asChild>
              <button className="flex items-center text-muted-foreground hover:bg-accent hover:text-accent-foreground px-1.5 py-0.5 rounded-md cursor-pointer focus:outline-none focus:ring-0">
                <MoreHorizontal size={14} />
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              className="max-h-80 overflow-y-auto w-64 p-1 flex flex-col gap-0.5"
            >
              {notePath.slice(0, notePath.length - 2).map((hiddenNode) => (
                <button
                  key={hiddenNode.id}
                  onClick={() => {
                    navigate(ROUTES.NOTE(hiddenNode.id));
                  }}
                  className="flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  {hiddenNode.emoji ? (
                    <span className="mr-2 shrink-0">{hiddenNode.emoji}</span>
                  ) : (
                    <FileText
                      size={14}
                      className="mr-2 shrink-0 text-muted-foreground"
                    />
                  )}
                  <span className="truncate">
                    {hiddenNode.title || "Untitled"}
                  </span>
                </button>
              ))}
            </HoverCardContent>
          </HoverCard>
        </BreadcrumbItem>
      </React.Fragment>,
      <React.Fragment key={pParent.id}>
        <BreadcrumbSeparator className="shrink-0" />
        <BreadcrumbItem className="shrink-0">
          {renderNoteDropdown(pParent)}
        </BreadcrumbItem>
      </React.Fragment>,
      <React.Fragment key={current.id}>
        <BreadcrumbSeparator className="shrink-0" />
        <BreadcrumbItem className="shrink-0">
          {renderNoteDropdown(current, true)}
        </BreadcrumbItem>
      </React.Fragment>,
    ];
  }

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <BreadcrumbItem className="shrink-0">
          <HoverCard openDelay={200} closeDelay={200}>
            <HoverCardTrigger asChild>
              <button
                className="flex items-center gap-1.5 text-sm hover:bg-accent hover:text-accent-foreground px-1.5 py-0.5 rounded-md cursor-pointer whitespace-nowrap focus:outline-none focus:ring-0"
                onClick={() => navigate(ROUTES.NOTES)}
              >
                <Folder size={14} strokeWidth={2} />
                <span className="truncate">{activeSpace.name}</span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              className="max-h-80 overflow-y-auto w-64 p-1 flex flex-col gap-0.5"
            >
              {spaces.map((space) => (
                <button
                  key={space.id}
                  onClick={() => {
                    navigate(ROUTES.NOTES);
                  }}
                  className={`flex items-center w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors ${
                    space.id === activeSpace.id
                      ? "bg-accent/50 text-accent-foreground "
                      : ""
                  }`}
                >
                  <Folder size={14} className="mr-2 shrink-0" />
                  <span className="truncate">{space.name}</span>
                </button>
              ))}
            </HoverCardContent>
          </HoverCard>
        </BreadcrumbItem>
        {renderedPath}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
