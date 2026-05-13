
import { format } from "date-fns";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const parts = [];
  if (item.spaceName) parts.push(item.spaceName);
  if (item.parentNoteTitle) parts.push(item.parentNoteTitle);
  if (item.lastEditedByUsername) parts.push(item.lastEditedByUsername);
  if (item.updatedAt)
    parts.push(`Edited ${format(new Date(item.updatedAt), "MMM d, yyyy")}`);

  const prefix = parts.length > 0 ? parts.join(" • ") : "";

  const description = prefix;

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn("w-full rounded-md px-2 h-auto", isSelected && "bg-accent")}
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
          {description && (
            <ItemDescription className="line-clamp-1 text-xs mt-0.5 opacity-80">
              {description}
            </ItemDescription>
          )}
        </ItemContent>
      </Item>
    </Button>
  );
}
