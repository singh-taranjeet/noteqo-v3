
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEARCH_LABELS } from "../constants/search.constants";
import type { SidebarSearchSection } from "@/features/workspace";
import { SearchResultRow } from "./SearchResultRow";

interface SearchResultListProps {
  sections: SidebarSearchSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
  hasAnyNotes: boolean;
}

export function SearchResultList({
  sections,
  selectedId,
  onSelect,
  onHover,
  hasAnyNotes,
}: Readonly<SearchResultListProps>) {
  const hasResults = sections.some((section) => section.items.length > 0);
  const emptyLabel = hasAnyNotes
    ? SEARCH_LABELS.EMPTY_RESULTS
    : SEARCH_LABELS.EMPTY_NOTES;

  return (
    <ScrollArea
      className="flex-1 h-full"
      aria-label={SEARCH_LABELS.SEARCH_RESULTS_REGION_LABEL}
    >
      {!hasResults ? (
        <div className="px-4 py-6 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      ) : (
        <div className="flex flex-col py-2">
          {sections.map((section) =>
            section.items.length > 0 ? (
              <div key={section.id} className="flex flex-col gap-1">
                <p className="px-4 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <SearchResultRow
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onSelect={onSelect}
                    onHover={onHover}
                  />
                ))}
              </div>
            ) : null,
          )}
        </div>
      )}
    </ScrollArea>
  );
}
