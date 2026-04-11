"use client";

import { useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import {
  useEffect,
  useState,
  useMemo,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import debounce from "lodash/debounce";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
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
import { ImageUploadNode } from "@/features/editor/components/nodes/ImageUploadNode/ImageUploadNodeExtension";
import { HorizontalRule } from "@/features/editor/components/nodes/HorizontalRuleNode/HorizontalRuleNodeExtension";
import { CodeBlockNode } from "@/features/editor/components/nodes/CodeBlockNode/CodeBlockNodeExtension";
import { TaskItemNode } from "@/features/editor/components/nodes/TaskItemNode/TaskItemNodeExtension";
import { HeadingNode } from "@/features/editor/components/nodes/HeadingNode/HeadingNodeExtension";

// --- Tiptap Features ---
import { SlashCommandExtension } from "@/features/editor/components/extensions/SlashCommand/SlashCommandExtension";

// --- AI Extension ---
import { AiExtension } from "@/features/ai";

// --- Tiptap Columns ---
import { ColumnsExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnsExtension";
import { ColumnExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnExtension";

// --- Tiptap Layouts ---
import { CardNodeExtension } from "@/features/editor/components/nodes/CardNode/CardNodeExtension";
import { AccordionNodeExtension } from "@/features/editor/components/nodes/AccordionNode/AccordionNodeExtension";

// --- Tiptap UI Hooks & Components ---

// --- Lib ---
import {
  handleImageUpload,
  MAX_FILE_SIZE,
} from "@/features/editor/utils/tiptapUtils";
import { EDITOR_CONFIG } from "@/features/editor/constants/editor.constants";
import { NOTE_DEFAULTS } from "@/features/workspace/constants/workspace.constants";
import { noteService } from "@/features/workspace/services/note.service";
import type { Note } from "@/features/workspace/types/workspace.types";
import { NoteEditorSurface } from "./NoteEditorSurface";
import { NoteEditorSkeleton } from "./NoteEditorSkeleton";

import DEFAULT_CONTENT from "@/features/editor/components/data/content.json";
import { logService } from "@/services/log.service";

interface NoteEditorProps {
  noteId?: string;
  note?: Note;
  isReadOnly?: boolean;
  disableRemoteLoad?: boolean;
  className?: string;
  contentWrapperClassName?: string;
}

interface LoadNoteContentOptions {
  noteId?: string;
  initialNote?: Note;
  disableRemoteLoad: boolean;
}

const useLoadNoteContent = ({
  noteId,
  initialNote,
  disableRemoteLoad,
}: Readonly<LoadNoteContentOptions>) => {
  const [note, setNote] = useState<Note | null>(initialNote ?? null);
  const [isReady, setIsReady] = useState<boolean>(Boolean(initialNote));

  useEffect(() => {
    async function loadContent() {
      if (noteId && !initialNote) {
        try {
          const localNote = await noteService.getLocalNote(noteId);

          if (localNote) {
            setNote(localNote);
            setIsReady(true);
          }

          if (disableRemoteLoad) {
            return;
          }

          const remoteNote = await noteService.getRemoteNote(noteId);

          if (remoteNote) {
            setNote(remoteNote);
            setIsReady(true);
          }
        } catch (error) {
          logService.error(`Error in rendering this note`, error);
        }
        logService.log("Note with NoteId is ready to load", noteId);
      }
    }
    loadContent();
  }, [disableRemoteLoad, initialNote, noteId]);

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
  disableRemoteLoad = false,
  className,
  contentWrapperClassName,
}: Readonly<NoteEditorProps>) {
  const debouncedUpdateNote = useMemo(
    () =>
      debounce((props: { editor: Editor; id: string }) => {
        const { editor, id } = props;
        const json = editor.getJSON();
        if (id) {
          void noteService.updateNote(id, { content: json });
        }
      }, EDITOR_CONFIG.AUTOSAVE_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedUpdateNote.cancel();
    };
  }, [debouncedUpdateNote]);

  const { note, isReady, setNote } = useLoadNoteContent({
    noteId,
    initialNote: providedNote,
    disableRemoteLoad,
  });

  const content = note?.content || DEFAULT_CONTENT;

  const editor = useEditor({
    immediatelyRender: false,
    editable: !isReadOnly,
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
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
      }),
      SlashCommandExtension,
      AiExtension,
      ColumnsExtension,
      ColumnExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      if (isReadOnly || !noteId) {
        return;
      }
      debouncedUpdateNote({ id: noteId, editor });
    },
  });

  useEffect(() => {
    if (editor && isReady && content) {
      // Defer to the macrotask queue to prevent React 19 flushSync collision during initial render loop
      setTimeout(() => {
        editor.commands.setContent(content);
      }, EDITOR_CONFIG.EVENT_LOOP_DEFER_MS);
    }
  }, [editor, isReady, content]);

  if (!isReady) {
    return <NoteEditorSkeleton />;
  }

  if (!editor) return null;

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (!note) return;
    setNote({ ...note, title: e.target.value });
  };

  const handleTitleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (!note || !noteId) return;
    void noteService.updateNote(noteId, { title: e.target.value });
  };

  return (
    <NoteEditorSurface
      editor={editor}
      title={note?.title ?? NOTE_DEFAULTS.TITLE}
      emoji={note?.emoji ?? ""}
      coverImage={note?.coverImage ?? ""}
      isReadOnly={isReadOnly}
      onTitleChange={handleTitleChange}
      onTitleBlur={handleTitleBlur}
      className={className}
      contentWrapperClassName={contentWrapperClassName}
    />
  );
}
