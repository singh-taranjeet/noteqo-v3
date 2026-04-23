"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SEARCH_LABELS } from "../constants/search.constants";
import type { SidebarSearchResultItem } from "@/features/workspace/types/sidebar-search.types";

interface SearchPreviewPaneProps {
  item: SidebarSearchResultItem | undefined;
}

export function SearchPreviewPane({ item }: Readonly<SearchPreviewPaneProps>) {
  if (!item) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
        {SEARCH_LABELS.EMPTY_PREVIEW}
      </div>
    );
  }

  const previewText = item.previewText || SEARCH_LABELS.CONTENT_UNAVAILABLE;

  return (
    <ScrollArea
      className="flex-1"
      aria-label={SEARCH_LABELS.PREVIEW_REGION_LABEL}
    >
      <div className="p-4">
        <Card size="sm" className="ring-border">
          <CardHeader>
            <div className="text-4xl" role="img" aria-hidden="true">
              {item.emoji}
            </div>
            <CardDescription>{item.spaceName}</CardDescription>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
            {previewText}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
