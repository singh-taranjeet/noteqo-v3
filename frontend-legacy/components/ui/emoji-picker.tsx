"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export interface EmojiData {
  emoji: string;
  name: string;
}

interface EmojiPickerProps {
  onEmojiClick: (emojiData: { emoji: string }) => void;
  width?: string | number;
}

const CATEGORY_LABELS: Record<string, string> = {
  "Smileys & Emotion": "Smileys",
  "People & Body": "People",
  Component: "Parts",
  "Animals & Nature": "Animals",
  "Food & Drink": "Food",
  "Travel & Places": "Travel",
  Activities: "Activities",
  Objects: "Objects",
  Symbols: "Symbols",
  Flags: "Flags",
};

export function EmojiPicker({
  onEmojiClick,
  width = "100%",
}: EmojiPickerProps) {
  const [search, setSearch] = React.useState("");
  const [emojisData, setEmojisData] = React.useState<Record<
    string,
    EmojiData[]
  > | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("Smileys & Emotion");

  React.useEffect(() => {
    import("@/data/emojis.json").then((module) => {
      setEmojisData(module.default as Record<string, EmojiData[]>);
    });
  }, []);

  const filteredEmojis = React.useMemo(() => {
    if (!emojisData) return {};
    if (!search.trim()) return emojisData;

    const term = search.toLowerCase();
    const result: Record<string, EmojiData[]> = {};

    for (const [group, emojis] of Object.entries(emojisData)) {
      const filtered = emojis.filter((e) =>
        e.name.toLowerCase().includes(term),
      );
      if (filtered.length > 0) {
        result[group] = filtered;
      }
    }
    return result;
  }, [search, emojisData]);

  return (
    <div className="flex flex-col bg-transparent" style={{ width }}>
      <div className="px-2 pt-0 pb-0 flex flex-col gap-1.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emojis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl bg-muted/40 border-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background transition-colors"
          />
        </div>

        {emojisData && !search && (
          <ScrollArea className="w-full whitespace-nowrap">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8 justify-start bg-transparent p-0 gap-1.5 w-max">
                {Object.keys(emojisData).map((group) => (
                  <TabsTrigger
                    key={group}
                    value={group}
                    className="text-xs px-2.5 py-1 rounded-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
                  >
                    {CATEGORY_LABELS[group] || group}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        )}
      </div>

      <div className="h-60 w-full overflow-y-auto overscroll-contain touch-pan-y relative mt-1 px-2">
        <div className="pb-4">
          {!emojisData ? (
            <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-1">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-9 rounded-md" />
              ))}
            </div>
          ) : search ? (
            Object.entries(filteredEmojis).map(([group, emojis]) => (
              <div key={group} className="mb-4 last:mb-0">
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm py-1.5 z-10 uppercase tracking-wider">
                  {CATEGORY_LABELS[group] || group}
                </h4>
                <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-1 justify-items-center">
                  {emojis.map((e) => (
                    <Button
                      key={e.emoji}
                      variant="ghost"
                      size="icon-sm"
                      title={e.name}
                      className="h-9 w-9 hover:scale-110 transition-all text-xl rounded-xl"
                      onClick={() => onEmojiClick({ emoji: e.emoji })}
                    >
                      {e.emoji}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-1 justify-items-center pt-1">
              {filteredEmojis[activeTab]?.map((e) => (
                <Button
                  key={e.emoji}
                  variant="ghost"
                  size="icon-sm"
                  title={e.name}
                  className="h-9 w-9 hover:scale-110 transition-all text-xl rounded-xl"
                  onClick={() => onEmojiClick({ emoji: e.emoji })}
                >
                  {e.emoji}
                </Button>
              ))}
            </div>
          )}
          {emojisData && Object.keys(filteredEmojis).length === 0 && search && (
            <div className="text-center p-6 text-sm text-muted-foreground">
              No emojis found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
