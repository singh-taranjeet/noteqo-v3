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
import { CalloutNodeExtension } from "@/features/editor/components/nodes/CalloutNode/CalloutNodeExtension";
import { DateNodeExtension } from "@/features/editor/components/nodes/DateNode/DateNodeExtension";
import { TocNodeExtension } from "@/features/editor/components/nodes/TocNode/TocNodeExtension";
import { ToggleNodeExtension } from "@/features/editor/components/nodes/ToggleNode/ToggleNodeExtension";
import { EmojiExtension } from "../components/editor-ui/emoji/EmojiExtension";
import { HashtagExtension } from "../components/editor-ui/hashtag/HashtagExtension";

// --- Tiptap File & Media ---
import { FileNodeExtension } from "@/features/editor/components/nodes/FileNode/FileNodeExtension";
import { FileUploaderExtension } from "@/features/editor/components/extensions/FileUploaderExtension";
import { ImageNodeExtension } from "@/features/editor/components/nodes/ImageNode/ImageNodeExtension";
import { VideoNodeExtension } from "@/features/editor/components/nodes/VideoNode/VideoNodeExtension";
import { AudioNodeExtension } from "@/features/editor/components/nodes/AudioNode/AudioNodeExtension";
import { PdfNodeExtension } from "@/features/editor/components/nodes/PdfNode/PdfNodeExtension";
import { EmbedNodeExtension } from "@/features/editor/components/nodes/EmbedNode/EmbedNodeExtension";
import { BookmarkNodeExtension } from "@/features/editor/components/nodes/BookmarkNode/BookmarkNodeExtension";

// --- Tiptap Table ---
import { TableNodeExtension } from "@/features/editor/components/nodes/TableNode/TableNodeExtension";

// --- Lib ---
import { EDITOR_CONFIG } from "@/features/editor/constants/editor.constants";

import { noteService, useCreateNote, type Note } from "@/features/workspace";
import { NoteLocalService } from "@/features/workspace/services/note-local.service";
import DEFAULT_CONTENT from "@/features/editor/components/data/content.json";
import { useNote } from "@/features/workspace";
import { SYNC_EVENTS } from "@/features/shared/constants/sync-events.constants";

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
  // to track if the editor is dirty | pendingupdates
  const pendingUpdates = useRef(false);

  const queueNoteUpdateRef = useRef<ReturnType<typeof debounce> | null>(null);

  useEffect(() => {
    queueNoteUpdateRef.current = debounce(
      (props: { editor: Editor; id: string }) => {
        const { editor, id } = props;
        const json = editor.getJSON();
        if (id) {
          void noteService.saveContentLocally(id, json);
          pendingUpdates.current = false;
        }
      },
      EDITOR_CONFIG.AUTOSAVE_DEBOUNCE_MS,
    );

    const handleBeforeUnload = () => {
      queueNoteUpdateRef.current?.flush();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
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
        CalloutNodeExtension,
        DateNodeExtension,
        TocNodeExtension,
        ToggleNodeExtension,
        EmojiExtension,
        HashtagExtension,

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
        AudioNodeExtension,
        PdfNodeExtension,
        EmbedNodeExtension,
        BookmarkNodeExtension,
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
        pendingUpdates.current = true;
        void NoteLocalService.update(noteId, { isDirty: 1 });
        queueNoteUpdateRef.current?.({ id: noteId, editor });
      },
    },
    [spaceId],
  );

  useEffect(() => {
    if (editor && !loading && content) {
      if (!isInitialized.current) {
        isInitialized.current = true;
        setTimeout(() => {
          if (!editor.isDestroyed) {
            editor.commands.setContent(content);
          }
        }, EDITOR_CONFIG.EVENT_LOOP_DEFER_MS);
        return;
      }

      if (pendingUpdates.current) {
        return;
      }

      const contentStr = JSON.stringify(content);

      // Also ensure we don't unnecessarily overwrite if the editor already has this exact content.
      const currentEditorContent = JSON.stringify(editor.getJSON());

      console.log("CONTENT IS UPDATED", contentStr !== currentEditorContent);

      // Defer to the macrotask queue to prevent React 19 flushSync collision during initial render loop
      setTimeout(() => {
        if (!editor.isDestroyed && contentStr !== currentEditorContent) {
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
      }

      // Write restored metadata to Dexie — useLiveQuery picks it up automatically
      void noteService.updateNote(noteId, {
        title: detail.title,
        emoji: detail.emoji,
        coverImage: detail.coverImage,
        content: detail.content,
      });
    };

    window.addEventListener(SYNC_EVENTS.RESTORE_VERSION, handleVersionRestored);
    return () => {
      window.removeEventListener(
        SYNC_EVENTS.RESTORE_VERSION,
        handleVersionRestored,
      );
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

    window.addEventListener(SYNC_EVENTS.CREATE_CHILD, handleCreateChildNote);
    return () => {
      window.removeEventListener(
        SYNC_EVENTS.CREATE_CHILD,
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
