"use client";
import { Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";

import React from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { TurnIntoDropdown } from "@/features/editor/components/editor-ui/TurnIntoDropdown";
import { ColorPickerPopover } from "@/features/editor/components/editor-ui/ColorPickerPopover";
import { MoreOptionsPopover } from "@/features/editor/components/editor-ui/MoreOptionsPopover";
import { AiMenu } from "@/features/ai";

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

const MENU_ITEMS = [
  {
    name: "bold",
    tooltip: "Bold (⌘B)",
    icon: Bold,
  },
  {
    name: "italic",
    tooltip: "Italic (⌘I)",
    icon: Italic,
  },
  {
    name: "underline",
    tooltip: "Underline (⌘U)",
    icon: Underline,
  },
  {
    name: "strike",
    tooltip: "Strikethrough (⌘⇧X)",
    icon: Strikethrough,
  },
  {
    name: "code",
    tooltip: "Code (⌘E)",
    icon: Code,
  },
] as const;

type MenuItemName = (typeof MENU_ITEMS)[number]["name"];

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({
  editor,
}) => {
  const [isTurnIntoOpen, setIsTurnIntoOpen] = React.useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = React.useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = React.useState(false);
  const [isAiMenuOpen, setIsAiMenuOpen] = React.useState(false);

  if (!editor) return null;

  const getCommand = (name: MenuItemName) => {
    switch (name) {
      case "bold":
        return () => editor.chain().focus().toggleBold().run();
      case "italic":
        return () => editor.chain().focus().toggleItalic().run();
      case "underline":
        return () => editor.chain().focus().toggleUnderline().run();
      case "strike":
        return () => editor.chain().focus().toggleStrike().run();
      case "code":
        return () => editor.chain().focus().toggleCode().run();
      default:
        return () => {};
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ view, state }) => {
        const { selection } = state;
        const { empty } = selection;

        // Do not show bubble menu for file attachments or images
        if (
          editor.isActive("fileAttachment") ||
          editor.isActive("encryptedImage")
        ) {
          return false;
        }

        // Prevent BubbleMenu from disappearing when interacting with Shadcn sub-menus
        if (
          isTurnIntoOpen ||
          isColorPickerOpen ||
          isMoreOptionsOpen ||
          isAiMenuOpen
        )
          return true;

        return view.hasFocus() && !empty;
      }}
      className="flex items-center gap-1 bg-popover rounded-md border shadow-md p-1"
    >
      <TurnIntoDropdown
        editor={editor}
        isOpen={isTurnIntoOpen}
        onOpenChange={setIsTurnIntoOpen}
      />

      <Separator orientation="vertical" className="h-4 mx-1" />

      <TooltipProvider delayDuration={200}>
        {MENU_ITEMS.map((item) => {
          const isActive = editor.isActive(item.name);
          const Icon = item.icon;
          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Toggle
                  type="button"
                  size="sm"
                  pressed={isActive}
                  onPressedChange={getCommand(item.name)}
                  aria-label={item.tooltip}
                  className="rounded-sm p-1.5 h-auto min-w-0"
                >
                  <Icon size={16} />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {item.tooltip}
              </TooltipContent>
            </Tooltip>
          );
        })}

        <Separator orientation="vertical" className="h-4 mx-1" />

        <ColorPickerPopover
          editor={editor}
          isOpen={isColorPickerOpen}
          onOpenChange={setIsColorPickerOpen}
        />

        <Separator orientation="vertical" className="h-4 mx-1" />

        <MoreOptionsPopover
          editor={editor}
          isOpen={isMoreOptionsOpen}
          onOpenChange={setIsMoreOptionsOpen}
        />

        <Separator orientation="vertical" className="h-4 mx-1" />

        <AiMenu
          editor={editor}
          isOpen={isAiMenuOpen}
          onOpenChange={setIsAiMenuOpen}
        />
      </TooltipProvider>
    </BubbleMenu>
  );
};
