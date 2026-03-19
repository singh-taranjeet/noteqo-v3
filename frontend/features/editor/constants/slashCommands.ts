import type { Editor, Range } from "@tiptap/core"

import { HeadingOneIcon } from "@/features/editor/components/icons/HeadingOneIcon"
import { HeadingTwoIcon } from "@/features/editor/components/icons/HeadingTwoIcon"
import { HeadingThreeIcon } from "@/features/editor/components/icons/HeadingThreeIcon"
import { AlignLeftIcon } from "@/features/editor/components/icons/AlignLeftIcon"
import { ListIcon } from "@/features/editor/components/icons/ListIcon"
import { ListOrderedIcon } from "@/features/editor/components/icons/ListOrderedIcon"
import { ListTodoIcon } from "@/features/editor/components/icons/ListTodoIcon"
import { BlockquoteIcon } from "@/features/editor/components/icons/BlockquoteIcon"
import { CodeBlockIcon } from "@/features/editor/components/icons/CodeBlockIcon"
import { Code2Icon } from "@/features/editor/components/icons/Code2Icon"
import { ImagePlusIcon } from "@/features/editor/components/icons/ImagePlusIcon"
import { ColumnsIcon } from "@/features/editor/components/icons/ColumnsIcon"

export interface SuggestionItem {
  title: string
  icon?: React.FC<React.SVGProps<SVGSVGElement>>
  shortcut?: string
  command: (props: { editor: Editor; range: Range }) => void
}

export const SLASH_COMMANDS: SuggestionItem[] = [
  {
    title: "Heading 1",
    icon: HeadingOneIcon,
    shortcut: "#",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
    },
  },
  {
    title: "Heading 2",
    icon: HeadingTwoIcon,
    shortcut: "##",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
    },
  },
  {
    title: "Heading 3",
    icon: HeadingThreeIcon,
    shortcut: "###",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
    },
  },
  {
    title: "Paragraph",
    icon: AlignLeftIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("paragraph").run()
    },
  },
  {
    title: "Bullet List",
    icon: ListIcon,
    shortcut: "-",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: "Numbered List",
    icon: ListOrderedIcon,
    shortcut: "1.",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: "To-do List",
    icon: ListTodoIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: "Blockquote",
    icon: BlockquoteIcon,
    shortcut: ">",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
  },
  {
    title: "Code Block",
    icon: CodeBlockIcon,
    shortcut: "```",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
  },
  {
    title: "Divider",
    icon: Code2Icon, // Using an abstract icon as horizontal rule
    shortcut: "---",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: "Image",
    icon: ImagePlusIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertContent({ type: "imageUpload" }).run()
    },
  },
  {
    title: "2 Columns",
    icon: ColumnsIcon,
    shortcut: "/2cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(2).run()
    },
  },
  {
    title: "3 Columns",
    icon: ColumnsIcon,
    shortcut: "/3cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(3).run()
    },
  },
]
