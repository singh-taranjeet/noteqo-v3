"use client";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  MoreVertical,
  Subscript,
  Superscript,
} from "lucide-react";

import React from "react";
import type { Editor } from "@tiptap/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoreOptionsPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MORE_OPTIONS_GROUPS = [
  [
    {
      name: "superscript",
      tooltip: "Superscript",
      icon: Superscript,
      command: (editor: Editor) =>
        editor.chain().focus().toggleSuperscript().run(),
      isActive: (editor: Editor) => editor.isActive("superscript"),
    },
    {
      name: "subscript",
      tooltip: "Subscript",
      icon: Subscript,
      command: (editor: Editor) =>
        editor.chain().focus().toggleSubscript().run(),
      isActive: (editor: Editor) => editor.isActive("subscript"),
    },
  ],
  [
    {
      name: "align-left",
      tooltip: "Align Left",
      icon: AlignLeft,
      command: (editor: Editor) =>
        editor.chain().focus().setTextAlign("left").run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: "left" }),
    },
    {
      name: "align-center",
      tooltip: "Align Center",
      icon: AlignCenter,
      command: (editor: Editor) =>
        editor.chain().focus().setTextAlign("center").run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: "center" }),
    },
    {
      name: "align-right",
      tooltip: "Align Right",
      icon: AlignRight,
      command: (editor: Editor) =>
        editor.chain().focus().setTextAlign("right").run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: "right" }),
    },
    {
      name: "align-justify",
      tooltip: "Justify",
      icon: AlignJustify,
      command: (editor: Editor) =>
        editor.chain().focus().setTextAlign("justify").run(),
      isActive: (editor: Editor) => editor.isActive({ textAlign: "justify" }),
    },
  ],
];

export const MoreOptionsPopover: React.FC<MoreOptionsPopoverProps> = ({
  editor,
  isOpen,
  onOpenChange,
}) => {
  return (
    <Popover modal={false} open={isOpen} onOpenChange={onOpenChange}>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Toggle
                type="button"
                size="sm"
                pressed={isOpen}
                aria-label="More options"
                className="rounded-sm p-1.5 h-auto min-w-0 data-[state=on]:bg-muted"
              >
                <MoreVertical size={16} />
              </Toggle>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            More options
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-auto p-1 flex flex-row items-center gap-1 z-50 shadow-md bg-popover rounded-md"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
      >
        <TooltipProvider delayDuration={200}>
          {MORE_OPTIONS_GROUPS.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && (
                <Separator orientation="vertical" className="h-5 mx-1" />
              )}
              {group.map((option) => {
                const active = option.isActive(editor);
                const Icon = option.icon;
                return (
                  <Tooltip key={option.name}>
                    <TooltipTrigger asChild>
                      <Toggle
                        type="button"
                        size="sm"
                        pressed={active}
                        onPressedChange={() => {
                          option.command(editor);
                        }}
                        aria-label={option.tooltip}
                        className="rounded-sm p-1.5 h-auto min-w-0"
                      >
                        <Icon size={16} />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {option.tooltip}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </TooltipProvider>
      </PopoverContent>
    </Popover>
  );
};
