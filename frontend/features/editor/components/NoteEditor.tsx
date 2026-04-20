"use client";

import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";

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
import { Underline } from "@tiptap/extension-underline";
import { Selection } from "@tiptap/extensions";

// --- Tiptap Node Custom Views ---
import { ImageUploadNode } from "@/features/editor/components/nodes/ImageUploadNode/ImageUploadNodeExtension";
import { HorizontalRule } from "@/features/editor/components/nodes/HorizontalRuleNode/HorizontalRuleNodeExtension";
import { CodeBlockNode } from "@/features/editor/components/nodes/CodeBlockNode/CodeBlockNodeExtension";
import { TaskItemNode } from "@/features/editor/components/nodes/TaskItemNode/TaskItemNodeExtension";
import { HeadingNode } from "@/features/editor/components/nodes/HeadingNode/HeadingNodeExtension";

// --- Tiptap Features ---
import { SlashCommandExtension } from "@/features/editor/components/extensions/SlashCommand/SlashCommandExtension";

// --- Tiptap Columns ---
import { ColumnsExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnsExtension";
import { ColumnExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnExtension";

// --- Tiptap Layouts ---
import { CardNodeExtension } from "@/features/editor/components/nodes/CardNode/CardNodeExtension";
import { AccordionNodeExtension } from "@/features/editor/components/nodes/AccordionNode/AccordionNodeExtension";

// --- Tiptap UI Hooks & Components ---
import { BlockDragHandle } from "@/features/editor/components/editor-ui/BlockDragHandle";
import { EditorBubbleMenu } from "@/features/editor/components/editor-ui/EditorBubbleMenu";

// --- Lib ---
import {
  handleImageUpload,
  MAX_FILE_SIZE,
} from "@/features/editor/utils/tiptapUtils";
import { EDITOR_STORAGE_KEY } from "@/features/editor/constants/editor.constants";
import { IS_BROWSER } from "@/lib/utils";
import { noteService } from "@/features/workspace/services/note.service";
import type { Note } from "@/features/workspace/types/workspace.types";

import content from "@/features/editor/components/data/content.json";

interface NoteEditorProps {
  noteId?: string;
}

export function NoteEditor({ noteId }: Readonly<NoteEditorProps>) {
  const [noteState, setNoteState] = useState<Note | null>(null);
  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null,
  );
  const [isReady, setIsReady] = useState(false);
  const editorTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    async function loadContent() {
      if (noteId) {
        try {
          const note = await noteService.getNote(noteId);
          // console.log("Note", note);
          if (note) {
            setNoteState(note);
            if (note.content) {
              setInitialContent(note.content as JSONContent);
            } else {
              setInitialContent(content);
            }
          } else {
            setInitialContent(content);
          }
        } catch {
          setInitialContent(content);
        }
      } else {
        if (IS_BROWSER) {
          const saved = localStorage.getItem(EDITOR_STORAGE_KEY);
          if (saved) {
            try {
              setInitialContent(JSON.parse(saved));
            } catch {
              setInitialContent(content);
            }
          } else {
            setInitialContent(content);
          }
        } else {
          setInitialContent(content);
        }
      }
      setIsReady(true);
    }
    loadContent();
  }, [noteId]);

  const editor = useEditor({
    immediatelyRender: false,
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
      Underline,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
      }),
      SlashCommandExtension,
      ColumnsExtension,
      ColumnExtension,
    ],
    content: initialContent ?? content,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      if (noteId) {
        if (editorTimeoutRef.current) clearTimeout(editorTimeoutRef.current);
        editorTimeoutRef.current = setTimeout(() => {
          void noteService.updateNote(noteId, { content: json });
        }, 500);
      } else {
        localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(json));
      }
    },
  });

  useEffect(() => {
    if (editor && isReady && initialContent) {
      // Defer to the macrotask queue to prevent React 19 flushSync collision during initial render loop
      setTimeout(() => {
        editor.commands.setContent(initialContent);
      }, 0);
    }
  }, [editor, isReady, initialContent]);

  if (!isReady) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-background text-muted-foreground text-sm">
        Loading note...
      </div>
    );
  }

  if (!editor) return null;

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!noteState) return;
    setNoteState({ ...noteState, title: e.target.value });
  };

  const handleTitleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (!noteState || !noteId) return;
    void noteService.updateNote(noteId, { title: e.target.value });
  };

  return (
    <div className="w-full h-full flex flex-col overflow-auto bg-background text-foreground font-sans group relative">
      {/* Cover Image */}
      {noteState?.coverImage && (
        <div className="w-full h-[25vh] sm:h-[30vh] shrink-0 relative group/cover">
          <img
            src={noteState.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col px-6 sm:px-24 mb-96 relative">
        {/* Note Header Metadata */}
        <div className="mt-8 mb-6">
          {noteState?.emoji && (
            <div className="text-[72px] leading-none mb-4 -mt-14 relative z-10 w-fit">
              {noteState.emoji}
            </div>
          )}

          <input
            type="text"
            className="text-4xl sm:text-5xl font-bold font-sans text-foreground w-full bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground"
            value={noteState?.title ?? "Untitled"}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            placeholder="Untitled"
          />
        </div>

        <EditorContext.Provider value={{ editor }}>
          <BlockDragHandle editor={editor} />
          <EditorBubbleMenu editor={editor} />
          <EditorContent
            editor={editor}
            role="presentation"
            className="flex-1 w-full"
          />
        </EditorContext.Provider>
      </div>
    </div>
  );
}
