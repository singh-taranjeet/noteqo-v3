"use client";

import { useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  useEffect,
  useState,
  useMemo,
  type ChangeEvent,
  type FocusEvent,
  useRef,
} from "react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- Tiptap Node Custom Views ---

import { HorizontalRule } from "@/features/editor/components/nodes/HorizontalRuleNode/HorizontalRuleNodeExtension";
import { CodeBlockNode } from "@/features/editor/components/nodes/CodeBlockNode/CodeBlockNodeExtension";
import { TaskItemNode } from "@/features/editor/components/nodes/TaskItemNode/TaskItemNodeExtension";
import { HeadingNode } from "@/features/editor/components/nodes/HeadingNode/HeadingNodeExtension";

// --- Tiptap Features ---
import { SlashCommandExtension } from "@/features/editor/components/extensions/SlashCommand/SlashCommandExtension";
import { MentionExtension } from "@/features/editor/components/extensions/MentionExtension/MentionExtension";

// --- AI Extension ---
import { AiExtension } from "@/features/ai";

// --- Tiptap Columns ---
import { ColumnsExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnsExtension";
import { ColumnExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnExtension";

// --- Tiptap Layouts ---
import { CardNodeExtension } from "@/features/editor/components/nodes/CardNode/CardNodeExtension";
import { AccordionNodeExtension } from "@/features/editor/components/nodes/AccordionNode/AccordionNodeExtension";

// --- Tiptap File & Media ---
import { FileNodeExtension } from "@/features/editor/components/nodes/FileNode/FileNodeExtension";
import { FileUploaderExtension } from "@/features/editor/components/extensions/FileUploaderExtension";
import { ImageNodeExtension } from "@/features/editor/components/nodes/ImageNode/ImageNodeExtension";
import { VideoNodeExtension } from "@/features/editor/components/nodes/VideoNode/VideoNodeExtension";

// --- Tiptap Table ---
import { TableNodeExtension } from "@/features/editor/components/nodes/TableNode/TableNodeExtension";

// --- Tiptap UI Hooks & Components ---

// --- Lib ---
import {
  EDITOR_CONFIG,
  VERSION_RESTORED_EVENT,
} from "@/features/editor/constants/editor.constants";

import { noteService, useCreateNote, type Note } from "@/features/workspace";
import { NoteEditorSurface } from "./NoteEditorSurface";
import { NoteEditorSkeleton } from "./NoteEditorSkeleton";

import DEFAULT_CONTENT from "@/features/editor/components/data/content.json";
import { useNote } from "@/features/workspace";

interface NoteEditorProps {
  noteId: string;
  note?: Note;
  isReadOnly?: boolean;
  className?: string;
  contentWrapperClassName?: string;
}

interface LoadNoteContentOptions {
  noteId?: string;
  initialNote?: Note;
}

const useLoadNoteContent = ({
  noteId,
  initialNote,
}: Readonly<LoadNoteContentOptions>) => {
  const { note, setNote } = useNote(noteId || "", initialNote || null);
  const [isReady, setIsReady] = useState(true);

  const [prevInitialNote, setPrevInitialNote] = useState<Note | undefined>(
    initialNote,
  );

  if (initialNote !== prevInitialNote) {
    setPrevInitialNote(initialNote);
    if (initialNote) {
      setNote(initialNote);
      setIsReady(true);
    }
  }

  return {
    note,
    isReady,
    setNote,
  };
};

export function NoteEditor({
  noteId,
  note: providedNote,
  isReadOnly = false,
  className,
  contentWrapperClassName,
}: Readonly<NoteEditorProps>) {
  const { mutate: createNoteMutation } = useCreateNote();

  const queueNoteUpdate = useMemo(
    () => (props: { editor: Editor; id: string }) => {
      const { editor, id } = props;
      const json = editor.getJSON();
      if (id) {
        void noteService.updateNote(id, { content: json });
      }
    },
    [],
  );

  const { note, isReady, setNote } = useLoadNoteContent({
    noteId,
    initialNote: providedNote,
  });

  const noteRef = useRef(note);
  useEffect(() => {
    noteRef.current = note;

    // Update the browser tab title dynamically since the server cannot read encrypted titles
    if (note?.title) {
      document.title = `${note.title} - Noteqo`;
    } else {
      document.title = "Noteqo";
    }
  }, [note]);

  const content = note?.content || DEFAULT_CONTENT;
  const spaceId = note?.spaceId ?? null;

  const isTrashed = !!note?.deletedAt;
  const editorIsReadOnly = isReadOnly || isTrashed;

  const editor = useEditor(
    {
      immediatelyRender: false,
      editable: !editorIsReadOnly,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Main content area, start typing to enter text.",
          class: "flex-1 focus:outline-none min-h-full",
        },
      },
      extensions: [
        StarterKit.configure({
          horizontalRule: false,
          codeBlock: false,
          heading: false,
          paragraph: {
            HTMLAttributes: {
              class: "leading-7 [&:not(:first-child)]:mt-6 outline-none",
            },
          },
          blockquote: {
            HTMLAttributes: {
              class:
                "mt-6 border-l-2 border-l-border pl-6 italic text-muted-foreground outline-none",
            },
          },
          bulletList: {
            HTMLAttributes: {
              class: "my-6 ml-6 list-disc [&>li]:mt-2 outline-none",
            },
          },
          orderedList: {
            HTMLAttributes: {
              class: "my-6 ml-6 list-decimal [&>li]:mt-2 outline-none",
            },
          },
          link: {
            openOnClick: false,
            enableClickSelection: true,
          },
        }),
        HorizontalRule,
        CodeBlockNode,
        HeadingNode,
        CardNodeExtension,
        AccordionNodeExtension,

        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList.configure({
          HTMLAttributes: {
            class: "my-6 ml-6 list-none [&>li]:mt-2 outline-none",
          },
        }),
        TaskItemNode.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        TextStyle,
        Color,
        Typography,
        Superscript,
        Subscript,
        Selection,
        SlashCommandExtension,
        MentionExtension.configure({
          getSpaceId: () => spaceId,
        }),
        AiExtension,
        ColumnsExtension,
        ColumnExtension,
        TableNodeExtension,
        FileNodeExtension,
        ImageNodeExtension,
        VideoNodeExtension,
        FileUploaderExtension.configure({
          getSpaceId: () => spaceId,
          getNoteId: () => noteId,
        }),
      ],
      content,
      onUpdate: ({ editor }) => {
        if (editorIsReadOnly || !noteId) {
          return;
        }
        queueNoteUpdate({ id: noteId, editor });
      },
    },
    [spaceId],
  );

  useEffect(() => {
    if (editor && isReady && content) {
      // Defer to the macrotask queue to prevent React 19 flushSync collision during initial render loop
      setTimeout(() => {
        editor.commands.setContent(content);
      }, EDITOR_CONFIG.EVENT_LOOP_DEFER_MS);
    }
  }, [editor, isReady, content]);

  // Listen for version-restore events to update editor content instantly
  useEffect(() => {
    if (!editor || editorIsReadOnly) return;

    const handleVersionRestored = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        noteId: string;
        title?: string;
        emoji?: string;
        coverImage?: string;
        content?: unknown;
      };

      if (detail.noteId !== noteId) return;

      // Update the Tiptap editor content
      if (detail.content) {
        editor.commands.setContent(detail.content);
      }

      // Update the note metadata (title, emoji, cover)
      setNote((prev) =>
        prev
          ? {
              ...prev,
              title: detail.title ?? prev.title,
              emoji: detail.emoji ?? prev.emoji,
              coverImage: detail.coverImage ?? prev.coverImage,
              content: detail.content ?? prev.content,
            }
          : prev,
      );
    };

    window.addEventListener(VERSION_RESTORED_EVENT, handleVersionRestored);
    return () => {
      window.removeEventListener(VERSION_RESTORED_EVENT, handleVersionRestored);
    };
  }, [editor, editorIsReadOnly, noteId, setNote]);

  // Listen for slash command to create child note
  useEffect(() => {
    if (!editor || editorIsReadOnly || !noteId || !spaceId) return;

    const handleCreateChildNote = () => {
      createNoteMutation({
        spaceId,
        parentId: noteId,
      });
    };

    window.addEventListener("noteqo:create-child-note", handleCreateChildNote);
    return () => {
      window.removeEventListener(
        "noteqo:create-child-note",
        handleCreateChildNote,
      );
    };
  }, [editor, editorIsReadOnly, noteId, spaceId, createNoteMutation]);

  if (!isReady) {
    return <NoteEditorSkeleton />;
  }

  if (!editor) return null;

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (editorIsReadOnly) return;
    if (!note) return;

    setNote({ ...note, title: e.target.value });
    void noteService.updateNote(noteId, { title: e.target.value });
  };

  const handleTitleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    // handleTitleChange(e);
  };

  return (
    <NoteEditorSurface
      editor={editor}
      title={note?.title}
      emoji={note?.emoji ?? ""}
      coverImage={note?.coverImage ?? ""}
      isReadOnly={editorIsReadOnly}
      isTrashed={isTrashed}
      spaceId={spaceId ?? undefined}
      noteId={noteId}
      onUpdateCoverImage={(url) => {
        if (!noteId) return;
        setNote((prev) => (prev ? { ...prev, coverImage: url } : prev));
        void noteService.updateNote(noteId, { coverImage: url });
      }}
      onUpdateEmoji={(emoji) => {
        if (!noteId) return;
        setNote((prev) => (prev ? { ...prev, emoji } : prev));
        void noteService.updateNote(noteId, { emoji });
      }}
      onTitleChange={handleTitleChange}
      onTitleBlur={handleTitleBlur}
      className={className}
      contentWrapperClassName={contentWrapperClassName}
    />
  );
}
