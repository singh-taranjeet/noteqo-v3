"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  FilterIcon,
  File01Icon,
  UserIcon,
  LayoutLeftIcon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SearchResultItem {
  id: string;
  emoji: string;
  title: string;
  spaceName?: string;
  folderPath?: string;
}

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Mock data (purely UI — no real search logic)                       */
/* ------------------------------------------------------------------ */

const MOCK_RESULTS: SearchResultItem[] = [
  { id: "1", emoji: "🎮", title: "Heat pump", spaceName: "Solar project" },
  { id: "2", emoji: "📄", title: "MISC" },
  { id: "3", emoji: "🌐", title: "Apple Id", spaceName: "MISC" },
  { id: "4", emoji: "🎆", title: "Solution Architect" },
  { id: "5", emoji: "🚀", title: "Solar project" },
  {
    id: "6",
    emoji: "🔐",
    title: "Multi-factor Authentication (MF...)",
    spaceName: "Solution Archite...",
    folderPath: "AWS SA — Lecture No...",
  },
  {
    id: "7",
    emoji: "🔑",
    title: "IAM Access Keys",
    spaceName: "Solution Architect",
    folderPath: "AWS SA — Lecture Note",
  },
  {
    id: "8",
    emoji: "👋",
    title: "Public Introduction",
    spaceName: "Solution Architect",
    folderPath: "AWS SA — Lecture Note",
  },
  {
    id: "9",
    emoji: "🪣",
    title: "S3 Basics",
    spaceName: "Solution Architect",
    folderPath: "AWS SA — Lecture Note",
  },
  {
    id: "10",
    emoji: "🏛",
    title: "Identity and Access Management (IA...)",
    spaceName: "Solution Arc...",
    folderPath: "AWS SA — Lectur...",
  },
  { id: "11", emoji: "🍊", title: "Notes", spaceName: "Solution Architect" },
  { id: "12", emoji: "📄", title: "Hewllod how are you" },
  { id: "13", emoji: "📄", title: "Mummy health insurance" },
  {
    id: "14",
    emoji: "✅",
    title: "Teamspace Home",
    spaceName: "Taranjeet Singh HQ",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SearchInput({
  value,
  onChange,
}: Readonly<{ value: string; onChange: (v: string) => void }>) {
  return (
    <div className="relative flex items-center">
      <HugeiconsIcon
        icon={Search01Icon}
        size={18}
        strokeWidth={1.5}
        className="absolute left-3 text-muted-foreground pointer-events-none"
      />
      <Input
        id="search-sheet-input"
        className="pl-10 pr-4 h-11 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-0 text-sm"
        placeholder="Search or ask a question..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      <div className="flex items-center gap-1 pr-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="Toggle layout"
        >
          <HugeiconsIcon icon={LayoutLeftIcon} size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}

function FilterBar() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs font-medium text-muted-foreground gap-1.5"
      >
        <span className="text-[11px] font-semibold tracking-wide">Aa</span>
        Title only
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs font-medium text-muted-foreground gap-1.5"
      >
        <HugeiconsIcon icon={UserIcon} size={14} strokeWidth={1.5} />
        Created by ▾
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs font-medium text-muted-foreground gap-1.5"
      >
        <HugeiconsIcon icon={File01Icon} size={14} strokeWidth={1.5} />
        In ▾
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs font-medium text-muted-foreground gap-1"
      >
        <HugeiconsIcon icon={FilterIcon} size={14} strokeWidth={1.5} />
        + Filter
      </Button>
    </div>
  );
}

function ResultRow({
  item,
  isSelected,
  onSelect,
  onHover,
}: Readonly<{
  item: SearchResultItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string) => void;
}>) {
  const subtitle = [item.spaceName, item.folderPath]
    .filter(Boolean)
    .join(" / ");

  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-3 w-full px-4 py-2 text-left transition-colors rounded-md cursor-pointer",
        "hover:bg-accent/50",
        isSelected && "bg-accent",
      )}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => onHover(item.id)}
    >
      <span className="shrink-0 text-base" role="img" aria-hidden="true">
        {item.emoji}
      </span>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-medium text-sm truncate">{item.title}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground truncate">
            — {subtitle}
          </span>
        )}
      </div>
    </button>
  );
}

function PreviewPanel({
  item,
}: Readonly<{ item: SearchResultItem | undefined }>) {
  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Hover over a result to preview
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Emoji + breadcrumb */}
      <div className="flex flex-col gap-1">
        <span className="text-4xl" role="img" aria-hidden="true">
          {item.emoji}
        </span>
        {item.spaceName && (
          <span className="text-xs text-muted-foreground">{item.spaceName}</span>
        )}
        <h3 className="text-lg font-semibold">{item.title}</h3>
      </div>

      {/* Placeholder content preview */}
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <div className="h-40 rounded-lg bg-accent/40 animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-accent/30 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-accent/30 animate-pulse" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function SearchSheet({
  open,
  onOpenChange,
}: Readonly<SearchSheetProps>) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(MOCK_RESULTS[0].id);
  const [hoveredId, setHoveredId] = useState<string>(MOCK_RESULTS[0].id);

  const previewItem = MOCK_RESULTS.find((r) => r.id === (hoveredId ?? selectedId));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="!w-[90vw] !max-w-none md:!w-[80vw] p-0 flex flex-col gap-0"
        showCloseButton={false}
      >
        {/* Accessible title — visually hidden since the search bar acts as the header */}
        <SheetTitle className="sr-only">Search notes</SheetTitle>

        {/* Search bar */}
        <SearchInput value={query} onChange={setQuery} />
        <Separator />

        {/* Filter chips */}
        <FilterBar />
        <Separator />

        {/* Two-pane body */}
        <div className="flex flex-1 min-h-0">
          {/* Left — Results list */}
          <div className="flex flex-col w-full md:w-[55%] md:border-r border-border">
            <p className="px-4 pt-3 pb-1 text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
              Past 30 days
            </p>
            <ScrollArea className="flex-1">
              <div className="flex flex-col py-1">
                {MOCK_RESULTS.map((item) => (
                  <ResultRow
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    onSelect={setSelectedId}
                    onHover={setHoveredId}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right — Preview pane (hidden on mobile) */}
          <div className="hidden md:flex md:flex-col md:flex-1">
            <ScrollArea className="flex-1">
              <PreviewPanel item={previewItem} />
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
