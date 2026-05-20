import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type {
  SidebarSearchResultItem,
  SidebarSearchSection,
} from "@/features/workspace";
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

interface SearchDialogProps {
  trigger: React.ReactNode;
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

export function SearchDialog({ trigger }: Readonly<SearchDialogProps>) {
  const [open, setOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { items, isLoading } = useSidebarSearchNotes();
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [titleOnly, setTitleOnly] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleOpenChange(nextOpen: boolean): void {
    if (isFilterOpen && !nextOpen) {
      return; // Do not close if filter dropdown is open
    }

    if (nextOpen) {
      // Ensure default behavior is full-text search (title + content) on each open.
      setTitleOnly(false);
      setSelectedPageIds([]);
    }

    setOpen(nextOpen);
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
      : null;

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

  function handleSelect(id: string): void {
    navigate(ROUTES.NOTE(id));
    setSelectedId(id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-5xl w-[95vw] md:w-[90vw] h-[85vh] md:h-[80vh] min-h-96 max-h-[calc(100vh-2rem)] p-2 md:p-4 shadow-2xl overflow-hidden flex flex-col gap-0 border-border bg-background"
      >
        <SearchHeaderInput
          onClose={() => setOpen(false)}
          value={queryInput}
          onChange={setQueryInput}
        />
        <SearchFilterBar
          titleOnly={titleOnly}
          onToggleTitleOnly={() => setTitleOnly((previous) => !previous)}
          pageOptions={pageOptions}
          selectedPageIds={selectedPageIds}
          onTogglePage={toggleSelectedPage}
          onClearPages={() => setSelectedPageIds([])}
          onDropdownOpenChange={setIsFilterOpen}
        />
        <div className="flex flex-1 min-h-0 mt-2">
          <div className="flex flex-col flex-1 min-w-0 min-h-0">
            <SearchResultList
              sections={sections}
              selectedId={selectedIdForView}
              onSelect={handleSelect}
              onHover={setHoveredId}
              hasAnyNotes={items.length > 0}
            />
          </div>
          <div className="hidden md:flex md:flex-col md:flex-none min-h-0 border rounded-xl shadow-2xl border-border/50 md:w-96 overflow-hidden">
            <SearchPreviewPane item={isLoading ? undefined : previewItem} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
