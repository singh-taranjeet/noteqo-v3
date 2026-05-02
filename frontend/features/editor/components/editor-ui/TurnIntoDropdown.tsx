"use client";

import React from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Tick02Icon,
  TextIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  ListViewIcon,
  LeftToRightListNumberIcon,
  Task01Icon,
  QuoteUpIcon,
  CodeCircleIcon,
} from "@hugeicons/core-free-icons";

interface TurnIntoDropdownProps {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TURN_INTO_OPTIONS = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor: Editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor: Editor) => editor.isActive("paragraph"),
  },
  {
    name: "Heading 1",
    icon: Heading01Icon,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading02Icon,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading03Icon,
    command: (editor: Editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "Bulleted list",
    icon: ListViewIcon,
    command: (editor: Editor) =>
      editor.chain().focus().toggleBulletList().run(),
    isActive: (editor: Editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered list",
    icon: LeftToRightListNumberIcon,
    command: (editor: Editor) =>
      editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor: Editor) => editor.isActive("orderedList"),
  },
  {
    name: "To-do list",
    icon: Task01Icon,
    command: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
    isActive: (editor: Editor) => editor.isActive("taskList"),
  },
  {
    name: "Blockquote",
    icon: QuoteUpIcon,
    command: (editor: Editor) =>
      editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor: Editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code block",
    icon: CodeCircleIcon,
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor: Editor) => editor.isActive("codeBlock"),
  },
];

export const TurnIntoDropdown: React.FC<TurnIntoDropdownProps> = ({
  editor,
  isOpen,
  onOpenChange,
}) => {
  const activeOption =
    TURN_INTO_OPTIONS.find((opt) => opt.isActive(editor)) ||
    TURN_INTO_OPTIONS[0];

  return (
    <Popover modal={false} open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-normal text-muted-foreground gap-1 hover:bg-muted/50 rounded-sm"
          onMouseDown={(e) => e.preventDefault()}
        >
          {activeOption.name}
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className="w-3 h-3 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-56 p-0 z-50 shadow-md bg-popover rounded-md overflow-hidden"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
      >
        <ScrollArea className="h-[280px] w-full p-1">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-1">
            Turn Into
          </div>
          {TURN_INTO_OPTIONS.map((option) => {
            const isActive = option.isActive(editor);
            return (
              <Button
                key={option.name}
                type="button"
                variant="ghost"
                onClick={() => {
                  option.command(editor);
                  onOpenChange(false);
                }}
                className={`w-full justify-between font-normal cursor-pointer rounded-xl px-3 py-2 h-auto text-sm outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive
                    ? "bg-accent/50 text-accent-foreground font-medium"
                    : "text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HugeiconsIcon
                    icon={option.icon}
                    className="text-muted-foreground shrink-0"
                    size={16}
                  />
                  <span>{option.name}</span>
                </div>
                {isActive && (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="shrink-0"
                    size={16}
                  />
                )}
              </Button>
            );
          })}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
