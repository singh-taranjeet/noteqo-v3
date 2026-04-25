"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { noteService } from "../services/note.service";
import { spaceService } from "@/features/spaces/services/space.service";
import { SEARCH_CONFIG } from "@/components/layout/Sidebar/constants/search.constants";
import type { SidebarSearchResultItem } from "../types/sidebar-search.types";
import type { Note } from "../types/workspace.types";

export const SIDEBAR_SEARCH_NOTES_QUERY_KEY = ["sidebar-search-notes"] as const;
export const SIDEBAR_SEARCH_SPACES_QUERY_KEY = [
  "sidebar-search-spaces",
] as const;

const CONTENT_TEXT_KEYS = ["text", "title", "content"] as const;

function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function truncateText(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit)}${SEARCH_CONFIG.ELLIPSIS}`;
}

function extractTextFromUnknown(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractTextFromUnknown);
  }

  if (value !== null && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const contentValues: string[] = [];

    for (const key of CONTENT_TEXT_KEYS) {
      const keyedValue = objectValue[key];
      if (typeof keyedValue === "string") {
        contentValues.push(keyedValue);
      }
    }

    return [
      ...contentValues,
      ...Object.values(objectValue).flatMap(extractTextFromUnknown),
    ];
  }

  return [];
}

function getBodyTextFromNote(note: Note): string {
  const extractedText = extractTextFromUnknown(note.content);
  const serializedContent =
    note.content !== null && note.content !== undefined
      ? JSON.stringify(note.content)
      : "";
  const joinedText = [...extractedText, serializedContent].join(" ");
  return joinedText.replace(/\s+/g, " ").trim();
}

function sortByRecent(lhs: Note, rhs: Note): number {
  const updatedDelta = toTimestamp(rhs.updatedAt) - toTimestamp(lhs.updatedAt);
  if (updatedDelta !== 0) {
    return updatedDelta;
  }

  return toTimestamp(rhs.createdAt) - toTimestamp(lhs.createdAt);
}

export function useSidebarSearchNotes() {
  const {
    data: notes = [],
    isLoading: isNotesLoading,
    error: notesError,
  } = useQuery({
    queryKey: SIDEBAR_SEARCH_NOTES_QUERY_KEY,
    queryFn: () => noteService.getAllLocalNotes(),
    refetchInterval: SEARCH_CONFIG.LOCAL_REFRESH_INTERVAL_MS,
  });

  const {
    data: spaces = [],
    isLoading: isSpacesLoading,
    error: spacesError,
  } = useQuery({
    queryKey: SIDEBAR_SEARCH_SPACES_QUERY_KEY,
    queryFn: () => spaceService.getLocalSpaces(),
    refetchInterval: SEARCH_CONFIG.LOCAL_REFRESH_INTERVAL_MS,
  });

  const items = useMemo<SidebarSearchResultItem[]>(() => {
    const spaceNameById = new Map(
      spaces.map((space) => [space.id, space.name]),
    );

    return [...notes].sort(sortByRecent).map((note) => {
      const bodyText = getBodyTextFromNote(note);
      const previewText = truncateText(
        bodyText,
        SEARCH_CONFIG.PREVIEW_TEXT_TRUNCATE,
      );
      const normalizedTitle = normalizeText(note.title);
      const normalizedBody = normalizeText(bodyText);

      return {
        id: note.id,
        title: note.title,
        emoji: note.emoji,
        coverImage: note.coverImage,
        content: note.content,
        spaceId: note.spaceId,
        spaceName: spaceNameById.get(note.spaceId) ?? "",
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        previewText,
        searchableTitle: normalizedTitle,
        searchableBody: normalizedBody,
      };
    });
  }, [notes, spaces]);

  return {
    items,
    isLoading: isNotesLoading || isSpacesLoading,
    error: notesError ?? spacesError ?? null,
  };
}
