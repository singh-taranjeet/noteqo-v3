import React, { useRef } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const AccordionNodeView = ({
  node,
  updateAttributes,
  editor,
}: NodeViewProps) => {
  const title = (node.attrs.title as string) || "";
  const isOpen = node.attrs.isOpen !== false; // defaults to true
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent Enter from submitting generic forms or firing strange prose actions when focused on title
    if (e.key === "Enter") {
      e.preventDefault();
      // If we wanted, we could move cursor into the body here natively, but standard blur is fine.
      inputRef.current?.blur();
      editor.commands.focus();
    }
  };

  return (
    <NodeViewWrapper className="w-full my-4 block not-prose">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? "item-1" : ""}
        onValueChange={(val) => updateAttributes({ isOpen: val === "item-1" })}
        className="w-full"
      >
        <AccordionItem value="item-1" className="bg-card">
          <AccordionTrigger
            className={cn(
              "hover:no-underline px-4",
              editor.isEditable && "[&_[data-slot=accordion-trigger-icon]]:hidden",
              !editor.isEditable && "pointer-events-none",
            )}
          >
            <Input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none shadow-none outline-none focus-visible:ring-0 text-sm  w-full min-w-12 pointer-events-auto"
              placeholder="Toggle Title"
              value={title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              onClick={(e) => {
                // Halts the accordion element from expanding/collapsing when interacting specifically with the text cursor
                e.stopPropagation();
              }}
              onKeyDown={handleInputKeyDown}
              disabled={!editor.isEditable}
            />
          </AccordionTrigger>
          {/* Custom persistent content wrapper bypassing Radix <Presence> tree destruction */}
          <div
            className={cn(
              "grid transition-all duration-200 ease-in-out",
              isOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden px-4">
              <div className="pb-4">
                <NodeViewContent className="min-h-[1.5em] prose dark:prose-invert max-w-none w-full [&>p]:m-0" />
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </NodeViewWrapper>
  );
};
