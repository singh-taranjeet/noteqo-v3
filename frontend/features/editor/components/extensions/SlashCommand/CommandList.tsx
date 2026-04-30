import React, { useState, forwardRef, useImperativeHandle } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList as CommandListWrapper,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import type { SuggestionItem } from "@/features/editor";
import { AI_SLASH_COMMANDS } from "@/features/editor/constants/slashCommands";

interface CommandListProps {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
  query: string;
  closeMenu: () => void;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(props.query);

  if (props.query !== prevQuery) {
    setPrevQuery(props.query);
    setSelectedIndex(0);
  }

  // Separate AI commands from standard commands for display
  const aiTitles = new Set(AI_SLASH_COMMANDS.map((c) => c.title));
  const standardItems = props.items.filter((item) => !aiTitles.has(item.title));
  const aiItems = props.items.filter((item) => aiTitles.has(item.title));

  const allItems = props.items;

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (selectedIndex + allItems.length - 1) % allItems.length,
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % allItems.length);
        return true;
      }

      if (event.key === "Enter") {
        const item = allItems[selectedIndex];
        if (item) {
          props.command(item);
          return true;
        }
      }

      return false;
    },
  }));

  if (!allItems.length) {
    return null;
  }

  const renderItem = (item: SuggestionItem, index: number) => {
    const Icon = item.icon;
    return (
      <CommandItem
        key={index}
        onSelect={() => props.command(item)}
        value={item.title}
        className={cn(
          "cursor-pointer",
          index === selectedIndex && "bg-accent text-accent-foreground",
        )}
      >
        {Icon && <HugeiconsIcon icon={Icon} className="mr-2 text-muted-foreground" size={16} />}
        <span>{item.title}</span>
        {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
      </CommandItem>
    );
  };

  return (
    <div className="w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
      <Command shouldFilter={false} className="border-none bg-transparent">
        <CommandListWrapper>
          {allItems.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {standardItems.length > 0 && (
            <CommandGroup heading="Basic blocks">
              {standardItems.map((item, index) => renderItem(item, index))}
            </CommandGroup>
          )}

          {aiItems.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="AI ✨">
                {aiItems.map((item, index) =>
                  renderItem(item, standardItems.length + index),
                )}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup>
            <CommandItem
              onSelect={props.closeMenu}
              onClick={(e) => {
                e.preventDefault();
                props.closeMenu();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="cursor-pointer"
            >
              <span>Close menu</span>
              <CommandShortcut>esc</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandListWrapper>
      </Command>
    </div>
  );
});

CommandList.displayName = "CommandList";
