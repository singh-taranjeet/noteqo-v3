import type { Editor, Range } from "@tiptap/core";
import type { IconSvgElement } from "@hugeicons/react";

import {
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  TextAlignLeftIcon,
  ListViewIcon,
  LeftToRightListNumberIcon,
  Task01Icon,
  QuoteUpIcon,
  CodeCircleIcon,
  CodeIcon,
  DashboardSquare01Icon,
  Note01Icon,
  ArrowDown01Icon,
  Table01Icon,
  AttachmentIcon,
  ImageAdd01Icon,
  CameraVideoIcon,
  FileAddIcon,
} from "@hugeicons/core-free-icons";
import type { AiActionType } from "@/features/ai/types/ai.types";

export interface SuggestionItem {
  title: string;
  icon?: IconSvgElement;
  shortcut?: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: SuggestionItem[] = [
  {
    title: "Heading 1",
    icon: Heading01Icon,
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
    icon: Heading02Icon,
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
    icon: Heading03Icon,
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
    icon: TextAlignLeftIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("paragraph").run();
    },
  },
  {
    title: "Bullet List",
    icon: ListViewIcon,
    shortcut: "-",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    icon: LeftToRightListNumberIcon,
    shortcut: "1.",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "To-do List",
    icon: Task01Icon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Blockquote",
    icon: QuoteUpIcon,
    shortcut: ">",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    title: "Code Block",
    icon: CodeCircleIcon,
    shortcut: "```",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    title: "Divider",
    icon: CodeIcon,
    shortcut: "---",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },

  {
    title: "2 Columns",
    icon: DashboardSquare01Icon,
    shortcut: "/2cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(2).run();
    },
  },
  {
    title: "3 Columns",
    icon: DashboardSquare01Icon,
    shortcut: "/3cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(3).run();
    },
  },
  {
    title: "Card",
    icon: Note01Icon,
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
    icon: ArrowDown01Icon,
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
    icon: Table01Icon,
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
    icon: AttachmentIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload();
    },
  },
  {
    title: "Image",
    icon: ImageAdd01Icon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload("image/*");
    },
  },
  {
    title: "Video",
    icon: CameraVideoIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload("video/*");
    },
  },
  {
    title: "Child Note",
    icon: FileAddIcon,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const event = new CustomEvent("noteqo:create-child-note", {
        bubbles: true,
      });
      editor.view.dom.dispatchEvent(event);
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
