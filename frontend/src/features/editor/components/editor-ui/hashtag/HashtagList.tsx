import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";

export interface HashtagListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface HashtagListProps {
  items: string[];
  command: (item: { id: string }) => void;
}

export const HashtagList = forwardRef<HashtagListRef, HashtagListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command({ id: item });
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length,
          );
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (!props.items || props.items.length === 0) {
      return null;
    }

    return (
      <div className="z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
        {props.items.map((item, index) => (
          <button
            type="button"
            className={cn(
              "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2 text-left",
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50",
            )}
            key={item}
            onClick={() => selectItem(index)}
          >
            <span className="font-semibold text-muted-foreground opacity-50">
              #
            </span>
            <span className="truncate">{item}</span>
          </button>
        ))}
      </div>
    );
  },
);

HashtagList.displayName = "HashtagList";
