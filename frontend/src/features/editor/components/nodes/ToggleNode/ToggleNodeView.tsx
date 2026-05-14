import React, { useRef } from "react";
import {
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const ToggleNodeView = ({
  node,
  updateAttributes,
  editor,
  selected,
}: NodeViewProps) => {
  const isOpen = node.attrs.isOpen;
  const title = (node.attrs.title as string) || "";
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleOpen = () => {
    if (!editor.isEditable) return;
    updateAttributes({ isOpen: !isOpen });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) updateAttributes({ isOpen: true });
      inputRef.current?.blur();
      editor.commands.focus();
    }
  };

  return (
    <NodeViewWrapper className="my-2 block group/toggle">
      <div
        className={cn(
          "flex items-start gap-1 w-full rounded-md transition-colors",
          selected ? "bg-muted/50 ring-1 ring-primary/20" : "",
        )}
      >
        <button
          type="button"
          contentEditable={false}
          onClick={toggleOpen}
          className="mt-1 h-5 w-5 shrink-0 rounded-sm hover:bg-black/5 dark:hover:bg-white/10 inline-flex items-center justify-center transition-colors focus:outline-none text-muted-foreground hover:text-foreground"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-90",
            )}
          />
        </button>
        <div className="flex-1 min-w-0 flex flex-col">
          <Input
            ref={inputRef}
            type="text"
            className="flex-1 h-7 px-0 bg-transparent border-none shadow-none outline-none focus-visible:ring-0 text-base font-medium w-full pointer-events-auto placeholder:font-normal placeholder:text-muted-foreground"
            placeholder="Toggle"
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            onKeyDown={handleInputKeyDown}
            disabled={!editor.isEditable}
          />
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out mt-1",
              isOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 pointer-events-none",
            )}
          >
            <div className="overflow-hidden">
              <NodeViewContent className="min-h-[1.5em] w-full pl-3 border-l-2 border-muted ml-1 pb-1" />
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
