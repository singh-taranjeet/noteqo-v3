import React, { useState, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList as CommandListWrapper,
} from "@/components/ui/command";
import type { Note } from "@/features/workspace";

interface MentionListProps {
  items: Note[];
  command: (item: { id: string; label: string; icon: string }) => void;
  query: string;
  closeMenu: () => void;
}

const MentionListInner = (
  props: MentionListProps,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: React.ForwardedRef<any>,
) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevQuery, setPrevQuery] = useState(props.query);

  if (props.query !== prevQuery) {
    setPrevQuery(props.query);
    setSelectedIndex(0);
  }

  const allItems = props.items;

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (!allItems.length) return false;

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
          props.command({ id: item.id, label: item.title, icon: item.emoji });
          return true;
        }
      }

      return false;
    },
  }));

  if (!allItems.length && props.query.length === 0) {
    return null;
  }

  const renderItem = (item: Note, index: number) => {
    return (
      <CommandItem
        key={item.id}
        onSelect={() =>
          props.command({ id: item.id, label: item.title, icon: item.emoji })
        }
        value={item.title}
        className={cn(
          "cursor-pointer gap-2",
          index === selectedIndex && "bg-accent text-accent-foreground",
        )}
      >
        <span className="flex size-4 items-center justify-center text-sm">
          {item.emoji || "📄"}
        </span>
        <span className="truncate">{item.title || "Untitled"}</span>
      </CommandItem>
    );
  };

  return (
    <div className="w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
      <Command shouldFilter={false} className="border-none bg-transparent">
        <CommandListWrapper>
          {allItems.length === 0 && (
            <div className="py-6 text-center text-sm">No notes found.</div>
          )}

          {allItems.length > 0 && (
            <CommandGroup heading="Link to page">
              {allItems.map((item, index) => renderItem(item, index))}
            </CommandGroup>
          )}
        </CommandListWrapper>
      </Command>
    </div>
  );
};

MentionListInner.displayName = "MentionList";
export const MentionList = forwardRef(MentionListInner);
