"use client";

import React, { useRef } from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const AccordionNodeView = ({ node, updateAttributes, editor }: NodeViewProps) => {
  const title = (node.attrs.title as string) || "";
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
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1" className="bg-card">
          <AccordionTrigger className="hover:no-underline px-4">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm font-medium w-full min-w-[50px] pointer-events-auto"
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
          <AccordionContent className="px-4 pb-4">
             <NodeViewContent className="min-h-[1.5em] prose dark:prose-invert max-w-none w-full [&>p]:m-0" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </NodeViewWrapper>
  );
};
