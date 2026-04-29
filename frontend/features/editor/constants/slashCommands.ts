import type { Editor, Range } from "@tiptap/core";

import { HeadingOneIcon } from "@/features/editor/components/icons/HeadingOneIcon";
import { HeadingTwoIcon } from "@/features/editor/components/icons/HeadingTwoIcon";
import { HeadingThreeIcon } from "@/features/editor/components/icons/HeadingThreeIcon";
import { AlignLeftIcon } from "@/features/editor/components/icons/AlignLeftIcon";
import { ListIcon } from "@/features/editor/components/icons/ListIcon";
import { ListOrderedIcon } from "@/features/editor/components/icons/ListOrderedIcon";
import { ListTodoIcon } from "@/features/editor/components/icons/ListTodoIcon";
import { BlockquoteIcon } from "@/features/editor/components/icons/BlockquoteIcon";
import { CodeBlockIcon } from "@/features/editor/components/icons/CodeBlockIcon";
import { Code2Icon } from "@/features/editor/components/icons/Code2Icon";
import { ColumnsIcon } from "@/features/editor/components/icons/ColumnsIcon";
import { CardIcon } from "@/features/editor/components/icons/CardIcon";
import { AccordionIcon } from "@/features/editor/components/icons/AccordionIcon";
import { TableIcon } from "@/features/editor/components/icons/TableIcon";
import { PaperclipIcon } from "lucide-react";
import type { AiActionType } from "@/features/ai/types/ai.types";

export interface SuggestionItem {
  title: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  shortcut?: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: SuggestionItem[] = [
  {
    title: "Heading 1",
    icon: HeadingOneIcon,
    shortcut: "#",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    icon: HeadingTwoIcon,
    shortcut: "##",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    icon: HeadingThreeIcon,
    shortcut: "###",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Paragraph",
    icon: AlignLeftIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("paragraph").run();
    },
  },
  {
    title: "Bullet List",
    icon: ListIcon,
    shortcut: "-",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    icon: ListOrderedIcon,
    shortcut: "1.",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "To-do List",
    icon: ListTodoIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Blockquote",
    icon: BlockquoteIcon,
    shortcut: ">",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    title: "Code Block",
    icon: CodeBlockIcon,
    shortcut: "```",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    title: "Divider",
    icon: Code2Icon, // Using an abstract icon as horizontal rule
    shortcut: "---",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  {
    title: "2 Columns",
    icon: ColumnsIcon,
    shortcut: "/2cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(2).run();
    },
  },
  {
    title: "3 Columns",
    icon: ColumnsIcon,
    shortcut: "/3cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(3).run();
    },
  },
  {
    title: "Card",
    icon: CardIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "shadcnCard",
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
  {
    title: "Accordion",
    icon: AccordionIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "shadcnAccordion",
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
  {
    title: "Table",
    icon: TableIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "notionTable",
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
  {
    title: "File Attachment",
    icon: PaperclipIcon as React.FC<React.SVGProps<SVGSVGElement>>,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload();
    },
  },
];

/**
 * AI slash command items — dispatches a custom event that AiMenu listens to.
 * The event carries the current paragraph text and action type so the
 * AiMenu can perform the action without requiring a text selection.
 */
export interface AiSuggestionItem extends SuggestionItem {
  aiActionType: AiActionType;
}

const dispatchAiSlashAction = (
  editor: Editor,
  range: Range,
  actionType: AiActionType,
) => {
  // Resolve the text of the paragraph that contains the slash command
  const { state } = editor;
  const { $from } = state.selection;
  const start = $from.start();
  const end = $from.end();
  const blockText = state.doc
    .textBetween(start, end, " ")
    .replace(/^\/\S*\s*/, "")
    .trim();

  // Delete the slash command text
  editor.chain().focus().deleteRange(range).run();

  // Dispatch custom event so AiMenu can handle the action
  const event = new CustomEvent("ai:slash-command", {
    detail: {
      actionType,
      selectedText: blockText,
      selectionFrom: start,
      selectionTo: end,
    },
    bubbles: true,
  });
  editor.view.dom.dispatchEvent(event);
};

export const AI_SLASH_COMMANDS: AiSuggestionItem[] = [
  {
    title: "AI: Reformat",
    aiActionType: "reformat",
    command: ({ editor, range }) =>
      dispatchAiSlashAction(editor, range, "reformat"),
  },
  {
    title: "AI: Fix Spelling",
    aiActionType: "spellcheck",
    command: ({ editor, range }) =>
      dispatchAiSlashAction(editor, range, "spellcheck"),
  },
  {
    title: "AI: Summarize",
    aiActionType: "summarize",
    command: ({ editor, range }) =>
      dispatchAiSlashAction(editor, range, "summarize"),
  },
  {
    title: "AI: To Accordion",
    aiActionType: "restructure_accordion",
    command: ({ editor, range }) =>
      dispatchAiSlashAction(editor, range, "restructure_accordion"),
  },
  {
    title: "AI: Wrap in Card",
    aiActionType: "restructure_card",
    command: ({ editor, range }) =>
      dispatchAiSlashAction(editor, range, "restructure_card"),
  },
];
