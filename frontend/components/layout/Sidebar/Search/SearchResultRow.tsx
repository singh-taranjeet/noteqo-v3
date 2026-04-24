"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { SidebarSearchResultItem } from "@/features/workspace";

interface SearchResultRowProps {
  item: SidebarSearchResultItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
}


export function SearchResultRow({
  item,
  isSelected,
  onSelect,
  onHover,
}: Readonly<SearchResultRowProps>) {
  const updatedTime = item.updatedAt
    ? `Updated ${formatDistanceToNow(new Date(item.updatedAt))} ago`
    : "";

  const description = item.spaceName
    ? `${item.spaceName} • ${item.previewText}`
    : item.previewText;

  return (
    <button
      type="button"
      className={cn("w-full rounded-md px-2", isSelected && "bg-accent")}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => onHover(item.id)}
      onFocus={() => onHover(item.id)}
    >
      <Item
        size="xs"
        className={cn(
          "cursor-pointer border-transparent text-left hover:bg-accent/50",
          isSelected && "bg-accent",
        )}
      >
        <ItemMedia className="text-base" role="img" aria-hidden="true">
          {item.emoji}
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="max-w-full truncate">{item.title}</ItemTitle>
          <ItemDescription className="line-clamp-1 text-xs">
            {description}
          </ItemDescription>
          {updatedTime && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {updatedTime}
            </div>
          )}
        </ItemContent>
      </Item>
    </button>
  );
}
