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
import debounce from "lodash/debounce";

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
import { ResizableImage } from "@/features/editor/components/nodes/ResizableImageNode/ResizableImageExtension";
import { ImageUploadNode } from "@/features/editor/components/nodes/ImageUploadNode/ImageUploadNodeExtension";
import { FileUploadNode } from "@/features/editor/components/nodes/FileUploadNode/FileUploadNodeExtension";
import {
  FileNode,
  AudioNode,
  VideoNode,
  Iframe,
} from "@/features/editor/components/nodes/MediaNodes/MediaNodesExtension";
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

// --- Tiptap Table ---
import { TableNodeExtension } from "@/features/editor/components/nodes/TableNode/TableNodeExtension";

// --- Tiptap UI Hooks & Components ---

// --- Lib ---
import { MAX_FILE_SIZE } from "@/features/editor/utils/tiptapUtils";
import { EDITOR_CONFIG } from "@/features/editor/constants/editor.constants";
import { mediaService } from "@/features/media/services/media.service";
import { NOTE_DEFAULTS } from "@/features/workspace/constants/workspace.constants";
import { noteService } from "@/features/workspace/services/note.service";
import type { Note } from "@/features/workspace/types/workspace.types";
import { NoteEditorSurface } from "./NoteEditorSurface";
import { NoteEditorSkeleton } from "./NoteEditorSkeleton";

import DEFAULT_CONTENT from "@/features/editor/components/data/content.json";
import { logService } from "@/services/log.service";

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
  isReadOnly: boolean;
}

const useLoadNoteContent = ({
  noteId,
  initialNote,
  isReadOnly = false,
}: Readonly<LoadNoteContentOptions>) => {
  const [note, setNote] = useState<Note | null>(initialNote ?? null);
  const [isReady, setIsReady] = useState<boolean>(Boolean(initialNote));

  useEffect(() => {
    async function loadContent() {
      if (noteId && !initialNote) {
        try {
          const localNote = await noteService.getLocalNote(noteId);

          console.log("This is localNote", localNote);
          if (localNote) {
            setNote(localNote);
            setIsReady(true);
          }

          if (isReadOnly) {
            return;
          }

          // Fetch decrypted note
          const remoteNote = await noteService.getRemoteNote(noteId);
          console.log("this is remote Note", remoteNote);

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
  }, [isReadOnly, initialNote, noteId]);

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

  const { note, isReady, setNote } = useLoadNoteContent({
    noteId,
    initialNote: providedNote,
    isReadOnly,
  });

  const noteRef = useRef(note);
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  useEffect(() => {
    return () => {
      debouncedUpdateNote.cancel();
    };
  }, [debouncedUpdateNote]);

  const content = note?.content || DEFAULT_CONTENT;

  const handlePasteFiles = async (editor: Editor, files: File[]) => {
    const currentNote = noteRef.current;
    if (!noteId || !currentNote?.spaceId) return;

    for (const file of files) {
      try {
        const url = await mediaService.uploadMedia(
          file,
          noteId,
          currentNote.spaceId,
        );
        const isImage = file.type.startsWith("image/");

        if (isImage) {
          editor.commands.insertContent({
            type: "image",
            attrs: { src: url, alt: file.name },
          });
        } else {
          editor.commands.insertContent({
            type: "fileAttachment",
            attrs: {
              src: url,
              filename: file.name,
              filetype: file.name.split(".").pop()?.toUpperCase() || "FILE",
            },
          });
        }
      } catch (err) {
        logService.error("Failed to paste file", err);
      }
    }
  };

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
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const hasFiles = items.some((item) => item.kind === "file");

        if (hasFiles) {
          event.preventDefault();
          const files = items
            .filter((item) => item.kind === "file")
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null);

          if (files.length > 0 && editor) {
            void handlePasteFiles(editor, files);
          }
          return true;
        }
        return false;
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
      ResizableImage,
      AudioNode,
      VideoNode,
      Iframe,
      Typography,
      Superscript,
      Subscript,
      Selection,
      // eslint-disable-next-line react-hooks/refs
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: async (file, onProgress, signal) => {
          const currentNote = noteRef.current;
          if (!noteId || !currentNote?.spaceId) {
            throw new Error("Cannot upload image before note is initialized.");
          }
          return mediaService.uploadMedia(
            file,
            noteId,
            currentNote.spaceId,
            onProgress,
            signal,
          );
        },
      }),
      // eslint-disable-next-line react-hooks/refs
      FileUploadNode.configure({
        accept: "*/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: async (file, onProgress, signal) => {
          const currentNote = noteRef.current;
          if (!noteId || !currentNote?.spaceId) {
            throw new Error("Cannot upload file before note is initialized.");
          }
          return mediaService.uploadMedia(
            file,
            noteId,
            currentNote.spaceId,
            onProgress,
            signal,
          );
        },
      }),
      FileNode,
      SlashCommandExtension,
      AiExtension,
      ColumnsExtension,
      ColumnExtension,
      TableNodeExtension,
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
