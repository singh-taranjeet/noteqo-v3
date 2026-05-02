"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SEARCH_LABELS } from "../constants/search.constants";

interface SearchFilterPageOption {
  id: string;
  title: string;
}

interface SearchFilterBarProps {
  titleOnly: boolean;
  onToggleTitleOnly: () => void;
  pageOptions: SearchFilterPageOption[];
  selectedPageIds: string[];
  onTogglePage: (pageId: string) => void;
  onClearPages: () => void;
}

function getInFilterLabel(selectedCount: number): string {
  if (selectedCount === 0) {
    return SEARCH_LABELS.FILTER_IN;
  }

  return `${SEARCH_LABELS.FILTER_IN} (${selectedCount})`;
}

export function SearchFilterBar({
  titleOnly,
  onToggleTitleOnly,
  pageOptions,
  selectedPageIds,
  onTogglePage,
  onClearPages,
}: Readonly<SearchFilterBarProps>) {
  const inFilterLabel = getInFilterLabel(selectedPageIds.length);

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Button
        variant={titleOnly ? "secondary" : "ghost"}
        size="sm"
        className="h-7 gap-1.5 text-xs font-medium"
        onClick={onToggleTitleOnly}
      >
        <span className="text-[11px] font-semibold tracking-wide">
          {SEARCH_LABELS.TITLE_ONLY_BADGE}
        </span>
        {SEARCH_LABELS.FILTER_TITLE_ONLY}
      </Button>

      {/* <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs font-medium text-muted-foreground"
        disabled
        title={SEARCH_LABELS.FILTER_CREATED_BY_UNAVAILABLE}
      >
        <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={1.5} />
        {SEARCH_LABELS.FILTER_CREATED_BY}
      </Button> */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <HugeiconsIcon icon={File01Icon} size={14} strokeWidth={1.5} />
            {inFilterLabel}
            <HugeiconsIcon icon={ArrowDown01Icon} size={12} strokeWidth={1.5} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>{SEARCH_LABELS.FILTER_IN}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={selectedPageIds.length === 0}
            onCheckedChange={onClearPages}
          >
            {SEARCH_LABELS.FILTER_PAGES_ALL}
          </DropdownMenuCheckboxItem>
          {pageOptions.length === 0 ? (
            <DropdownMenuLabel>
              {SEARCH_LABELS.FILTER_PAGES_EMPTY}
            </DropdownMenuLabel>
          ) : (
            pageOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={selectedPageIds.includes(option.id)}
                onCheckedChange={() => onTogglePage(option.id)}
              >
                {option.title}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs font-medium text-muted-foreground"
      >
        <HugeiconsIcon icon={FilterIcon} size={14} strokeWidth={1.5} />
        {SEARCH_LABELS.FILTER_ADD}
      </Button> */}
    </div>
  );
}
