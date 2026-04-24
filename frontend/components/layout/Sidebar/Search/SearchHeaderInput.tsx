"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { LayoutLeftIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SEARCH_LABELS } from "../constants/search.constants";

interface SearchHeaderInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose(): void;
}

export function SearchHeaderInput({
  value,
  onChange,
  onClose,
}: Readonly<SearchHeaderInputProps>) {
  return (
    <div className="relative flex items-center">
      <HugeiconsIcon
        icon={Search01Icon}
        size={18}
        strokeWidth={1.5}
        className="pointer-events-none absolute left-3 text-muted-foreground"
      />
      <Input
        id="search-sheet-input"
        className="h-11 rounded-none border-0 bg-transparent pr-4 pl-10 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0"
        placeholder={SEARCH_LABELS.SEARCH_PLACEHOLDER}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus
      />
      <div className="flex items-center gap-1 pr-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-muted-foreground"
          aria-label={SEARCH_LABELS.SEARCH_RESULTS_REGION_LABEL}
        >
          <HugeiconsIcon  icon={LayoutLeftIcon} size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
