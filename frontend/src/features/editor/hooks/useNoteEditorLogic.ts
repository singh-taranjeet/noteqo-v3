import { useEditor, type Editor } from "@tiptap/react";
import { useEffect, type ChangeEvent, type FocusEvent, useRef } from "react";
import debounce from "lodash.debounce";

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

// --- Lib ---
import {
  EDITOR_CONFIG,
  VERSION_RESTORED_EVENT,
} from "@/features/editor/constants/editor.constants";

import { noteService, useCreateNote, type Note } from "@/features/workspace";
import DEFAULT_CONTENT from "@/features/editor/components/data/content.json";
import { useNote } from "@/features/workspace";

export interface UseNoteEditorLogicProps {
  noteId: string;
  initialNote?: Note;
  isReadOnly?: boolean;
}

export function useNoteEditorLogic({
  noteId,
  initialNote,
  isReadOnly = false,
}: UseNoteEditorLogicProps) {
  const { mutate: createNoteMutation } = useCreateNote();

  const isInitialized = useRef(false);
  const lastSavedContent = useRef<string | null>(null);
  const hasPendingChanges = useRef(false);

  const queueNoteUpdateRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    queueNoteUpdateRef.current = debounce(
      (props: { editor: Editor; id: string }) => {
        const { editor, id } = props;
        const json = editor.getJSON();
        lastSavedContent.current = JSON.stringify(json);
        if (id) {
          void noteService.updateNote(id, { content: json });
        }
        hasPendingChanges.current = false;
      },
      EDITOR_CONFIG.AUTOSAVE_DEBOUNCE_MS,
    );

    return () => {
      queueNoteUpdateRef.current?.cancel();
    };
  }, []);

  const { note, loading } = useNote({
    id: noteId,
    initialNote,
    readonly: isReadOnly,
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
        hasPendingChanges.current = true;
        queueNoteUpdateRef.current?.({ id: noteId, editor });
      },
    },
    [spaceId],
  );

  useEffect(() => {
    if (editor && !loading && content) {
      if (!isInitialized.current) {
        isInitialized.current = true;
        lastSavedContent.current = JSON.stringify(content);
        setTimeout(() => {
          if (!editor.isDestroyed) {
            editor.commands.setContent(content);
          }
        }, EDITOR_CONFIG.EVENT_LOOP_DEFER_MS);
        return;
      }

      // If the user is actively typing or has pending un-debounced changes,
      // DO NOT overwrite their content. This prevents their active typing from
      // being erased by remote updates or slightly modified local saves echoing back.
      if (editor.isFocused || hasPendingChanges.current) {
        return;
      }

      const contentStr = JSON.stringify(content);

      // Prevent resetting the editor to an older state if useLiveQuery
      // triggers after a local debounced save.
      if (lastSavedContent.current === contentStr) {
        return;
      }

      // Also ensure we don't unnecessarily overwrite if the editor already has this exact content.
      const currentEditorContent = JSON.stringify(editor.getJSON());
      if (currentEditorContent === contentStr) {
        lastSavedContent.current = contentStr;
        return;
      }

      lastSavedContent.current = contentStr;

      // Defer to the macrotask queue to prevent React 19 flushSync collision during initial render loop
      setTimeout(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(content);
        }
      }, EDITOR_CONFIG.EVENT_LOOP_DEFER_MS);
    }
  }, [editor, loading, content]);

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
      if (detail.content && !editor.isDestroyed) {
        editor.commands.setContent(detail.content);
        lastSavedContent.current = JSON.stringify(detail.content);
      }

      // Write restored metadata to Dexie — useLiveQuery picks it up automatically
      void noteService.updateNote(noteId, {
        title: detail.title,
        emoji: detail.emoji,
        coverImage: detail.coverImage,
        content: detail.content,
      });
    };

    window.addEventListener(VERSION_RESTORED_EVENT, handleVersionRestored);
    return () => {
      window.removeEventListener(VERSION_RESTORED_EVENT, handleVersionRestored);
    };
  }, [editor, editorIsReadOnly, noteId]);

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

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (editorIsReadOnly) return;
    if (!note) return;

    // Write to Dexie — useLiveQuery picks up the change automatically
    void noteService.updateNote(noteId, { title: e.target.value });
  };

  const handleTitleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    // handleTitleChange(e);
  };

  const updateCoverImage = (url: string) => {
    if (!noteId) return;
    void noteService.updateNote(noteId, { coverImage: url });
  };

  const updateEmoji = (emoji: string) => {
    if (!noteId) return;
    void noteService.updateNote(noteId, { emoji });
  };

  return {
    editor,
    note,
    loading,
    isTrashed,
    editorIsReadOnly,
    spaceId,
    handleTitleChange,
    handleTitleBlur,
    updateCoverImage,
    updateEmoji,
  };
}
