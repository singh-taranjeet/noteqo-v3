"use client"

import React from "react"
import { Editor } from "@tiptap/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon } from "@/features/editor/components/icons/ChevronDownIcon"

// Icons
import { TextIcon } from "@/features/editor/components/icons/TextIcon"
import { HeadingOneIcon } from "@/features/editor/components/icons/HeadingOneIcon"
import { HeadingTwoIcon } from "@/features/editor/components/icons/HeadingTwoIcon"
import { HeadingThreeIcon } from "@/features/editor/components/icons/HeadingThreeIcon"
import { ListIcon } from "@/features/editor/components/icons/ListIcon"
import { ListOrderedIcon } from "@/features/editor/components/icons/ListOrderedIcon"
import { ListTodoIcon } from "@/features/editor/components/icons/ListTodoIcon"
import { BlockquoteIcon } from "@/features/editor/components/icons/BlockquoteIcon"
import { CodeBlockIcon } from "@/features/editor/components/icons/CodeBlockIcon"

interface TurnIntoDropdownProps {
  editor: Editor
  isOpen: boolean
  onOpenChange: (open: boolean) => void
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
    icon: HeadingOneIcon,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: HeadingTwoIcon,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: HeadingThreeIcon,
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "Bulleted list",
    icon: ListIcon,
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor: Editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered list",
    icon: ListOrderedIcon,
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor: Editor) => editor.isActive("orderedList"),
  },
  {
    name: "To-do list",
    icon: ListTodoIcon,
    command: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
    isActive: (editor: Editor) => editor.isActive("taskList"),
  },
  {
    name: "Blockquote",
    icon: BlockquoteIcon,
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor: Editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code block",
    icon: CodeBlockIcon,
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    isActive: (editor: Editor) => editor.isActive("codeBlock"),
  },
]

export const TurnIntoDropdown: React.FC<TurnIntoDropdownProps> = ({ editor, isOpen, onOpenChange }) => {
  const activeOption = TURN_INTO_OPTIONS.find((opt) => opt.isActive(editor)) || TURN_INTO_OPTIONS[0]

  return (
    <Popover modal={true} open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs font-normal text-muted-foreground gap-1 hover:bg-muted/50 rounded-sm"
          onMouseDown={(e) => e.preventDefault()}
        >
          {activeOption.name}
          <ChevronDownIcon className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        className="w-56 p-1"
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-1">Turn Into</div>
        {TURN_INTO_OPTIONS.map((option) => (
          <Button
            key={option.name}
            type="button"
            variant="ghost"
            onClick={() => {
              option.command(editor)
              onOpenChange(false)
            }}
            className="w-full justify-start gap-2 font-normal cursor-pointer rounded-sm px-2 py-1.5 h-auto text-sm"
          >
            <div className="flex items-center justify-center w-6 h-6 border rounded-sm bg-background shrink-0">
              <option.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <span>{option.name}</span>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
