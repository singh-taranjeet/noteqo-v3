"use client";

import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type {
  SidebarSearchResultItem,
  SidebarSearchSection,
} from "@/features/workspace/types/sidebar-search.types";
import { useSidebarSearchNotes } from "@/features/workspace";
import { SEARCH_CONFIG, SEARCH_LABELS } from "./constants/search.constants";
import { SearchFilterBar } from "./Search/SearchFilterBar";
import { SearchHeaderInput } from "./Search/SearchHeaderInput";
import { SearchPreviewPane } from "./Search/SearchPreviewPane";
import { SearchResultList } from "./Search/SearchResultList";

const RESULT_SECTION_IDS = {
  RECENT: "recent",
  OLDER: "older",
} as const;

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toTimestamp(value: string): number {
  return new Date(value).getTime();
}

function isRecentItem(item: SidebarSearchResultItem): boolean {
  const daysInWindow = SEARCH_CONFIG.RECENT_DAYS_WINDOW;
  const nowTimestamp = Date.now();
  const noteTimestamp = Math.max(
    toTimestamp(item.updatedAt),
    toTimestamp(item.createdAt),
  );
  const diffInDays = (nowTimestamp - noteTimestamp) / (1000 * 60 * 60 * 24);
  return diffInDays <= daysInWindow;
}

export function SearchSheet({
  open,
  onOpenChange,
}: Readonly<SearchSheetProps>) {
  const { items, isLoading } = useSidebarSearchNotes();
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [titleOnly, setTitleOnly] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      // Ensure default behavior is full-text search (title + content) on each open.
      setTitleOnly(false);
      setSelectedPageIds([]);
    }

    onOpenChange(nextOpen);
  }

  useEffect(() => {
    const timeout = globalThis.setTimeout(
      () => setQuery(queryInput.trim().toLowerCase()),
      SEARCH_CONFIG.QUERY_DEBOUNCE_MS,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [queryInput]);

  const pageOptions = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.title,
      })),
    [items],
  );

  const filteredItems = useMemo(() => {
    const scopedItems =
      selectedPageIds.length === 0
        ? items
        : items.filter((item) => selectedPageIds.includes(item.id));

    if (query.length === 0) {
      return scopedItems;
    }

    return scopedItems.filter((item) => {
      const titleMatches = item.searchableTitle.includes(query);
      if (titleOnly) {
        return titleMatches;
      }

      return titleMatches || item.searchableBody.includes(query);
    });
  }, [items, query, selectedPageIds, titleOnly]);

  const sections = useMemo<SidebarSearchSection[]>(() => {
    const recentItems = filteredItems.filter(isRecentItem);
    const olderItems = filteredItems.filter((item) => !isRecentItem(item));

    return [
      {
        id: RESULT_SECTION_IDS.RECENT,
        label: SEARCH_LABELS.SECTION_RECENT,
        items: recentItems,
      },
      {
        id: RESULT_SECTION_IDS.OLDER,
        label: SEARCH_LABELS.SECTION_OLDER,
        items: olderItems,
      },
    ];
  }, [filteredItems]);

  const selectedIdForView =
    selectedId !== null && filteredItems.some((item) => item.id === selectedId)
      ? selectedId
      : (filteredItems[0]?.id ?? null);

  const hoveredIdForView =
    hoveredId !== null && filteredItems.some((item) => item.id === hoveredId)
      ? hoveredId
      : selectedIdForView;

  const previewId = hoveredIdForView ?? selectedIdForView;
  const previewItem = filteredItems.find((item) => item.id === previewId);

  function toggleSelectedPage(pageId: string): void {
    setSelectedPageIds((previous) =>
      previous.includes(pageId)
        ? previous.filter((id) => id !== pageId)
        : [...previous, pageId],
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="!w-[100vw] !max-w-none md:!wd-[80vw] p-0 flex flex-col gap-0"
        showCloseButton={false}
      >
        <SheetTitle className="sr-only">{SEARCH_LABELS.SHEET_TITLE}</SheetTitle>
        <SearchHeaderInput value={queryInput} onChange={setQueryInput} />
        <Separator />
        <SearchFilterBar
          titleOnly={titleOnly}
          onToggleTitleOnly={() => setTitleOnly((previous) => !previous)}
          pageOptions={pageOptions}
          selectedPageIds={selectedPageIds}
          onTogglePage={toggleSelectedPage}
          onClearPages={() => setSelectedPageIds([])}
        />
        <Separator />
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col w-full md:w-[55%] md:border-r border-border">
            <SearchResultList
              sections={sections}
              selectedId={selectedIdForView}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              hasAnyNotes={items.length > 0}
            />
          </div>
          <div className="hidden md:flex md:flex-col md:flex-1">
            <SearchPreviewPane item={isLoading ? undefined : previewItem} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
