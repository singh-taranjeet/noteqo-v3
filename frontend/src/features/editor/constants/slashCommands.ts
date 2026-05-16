import {
  AlignLeft,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Code,
  Code2,
  File,
  FilePlus,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Info,
  LayoutDashboard,
  List,
  ListOrdered,
  ListTree,
  Link2,
  Mic,
  MonitorPlay,
  Paperclip,
  Quote,
  Table,
  Video,
} from "lucide-react";
import type { Editor, Range } from "@tiptap/core";
import type { LucideIcon } from "lucide-react";

import type { AiActionType } from "@/features/ai/types/ai.types";

export interface SuggestionItem {
  title: string;
  icon?: LucideIcon;
  shortcut?: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const SLASH_COMMANDS: SuggestionItem[] = [
  {
    title: "Heading 1",
    icon: Heading1,
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
    icon: Heading2,
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
    icon: Heading3,
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
    icon: AlignLeft,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("paragraph").run();
    },
  },
  {
    title: "Bullet List",
    icon: List,
    shortcut: "-",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    icon: ListOrdered,
    shortcut: "1.",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "To-do List",
    icon: CheckSquare,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Blockquote",
    icon: Quote,
    shortcut: ">",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    title: "Code Block",
    icon: Code2,
    shortcut: "```",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
  {
    title: "Divider",
    icon: Code,
    shortcut: "---",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Table of Contents",
    icon: ListTree,
    shortcut: "/toc",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "toc",
        })
        .run();
    },
  },

  {
    title: "2 Columns",
    icon: LayoutDashboard,
    shortcut: "/2cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(2).run();
    },
  },
  {
    title: "3 Columns",
    icon: LayoutDashboard,
    shortcut: "/3cols",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setColumns(3).run();
    },
  },
  {
    title: "Card",
    icon: File,
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
    icon: ChevronDown,
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
    title: "Toggle List",
    icon: ChevronRight,
    shortcut: ">",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "toggle",
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
  {
    title: "Callout",
    icon: Info,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "callout",
          content: [{ type: "paragraph" }],
        })
        .run();
    },
  },
  {
    title: "Date",
    icon: CalendarDays,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "date",
        })
        .run();
    },
  },
  {
    title: "Table",
    icon: Table,
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
    icon: Paperclip,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload();
    },
  },
  {
    title: "Image",
    icon: ImagePlus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload("image/*");
    },
  },
  {
    title: "Video",
    icon: Video,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload("video/*");
    },
  },
  {
    title: "Audio",
    icon: Mic,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload("audio/*");
    },
  },
  {
    title: "PDF Document",
    icon: FileText,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      editor.commands.promptFileUpload("application/pdf");
    },
  },
  {
    title: "Web Bookmark",
    icon: Link2,
    command: ({ editor, range }) => {
      const url = window.prompt("Enter URL for bookmark:");
      if (url) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: "bookmark",
            attrs: { url },
          })
          .run();
      } else {
        editor.chain().focus().deleteRange(range).run();
      }
    },
  },
  {
    title: "Embed Media",
    icon: MonitorPlay,
    command: ({ editor, range }) => {
      const url = window.prompt(
        "Enter Embed URL (YouTube, Vimeo, Figma, etc):",
      );
      if (url) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: "embed",
            attrs: { url },
          })
          .run();
      } else {
        editor.chain().focus().deleteRange(range).run();
      }
    },
  },
  {
    title: "Child Note",
    icon: FilePlus,
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
