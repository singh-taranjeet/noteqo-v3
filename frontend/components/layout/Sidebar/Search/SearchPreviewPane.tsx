"use client";

import { NoteEditor } from "@/features/editor/components/NoteEditor";
import { SEARCH_LABELS } from "../constants/search.constants";
import type { SidebarSearchResultItem } from "@/features/workspace/types/sidebar-search.types";
import type { Note } from "@/features/workspace/types/workspace.types";

interface SearchPreviewPaneProps {
  item: SidebarSearchResultItem | undefined;
}

function toPreviewNote(item: SidebarSearchResultItem): Note {
  return {
    id: item.id,
    title: item.title,
    emoji: item.emoji,
    coverImage: item.coverImage,
    content: item.content,
    syncStatus: "synced",
    spaceId: item.spaceId,
    type: "private",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function SearchPreviewPane({ item }: Readonly<SearchPreviewPaneProps>) {
  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        {SEARCH_LABELS.EMPTY_PREVIEW}
      </div>
    );
  }

  const previewNote = toPreviewNote(item);

  return (
    <div className="h-full" aria-label={SEARCH_LABELS.PREVIEW_REGION_LABEL}>
      <NoteEditor
        key={previewNote.id}
        note={previewNote}
        isReadOnly
        disableRemoteLoad
        className="h-full"
        contentWrapperClassName="mb-0 px-6 sm:px-8"
      />
    </div>
  );
}
