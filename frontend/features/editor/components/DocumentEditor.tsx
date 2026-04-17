"use client"

import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"
import { Selection } from "@tiptap/extensions"

// --- Tiptap Node Custom Views ---
import { ImageUploadNode } from "@/features/editor/components/nodes/ImageUploadNode/ImageUploadNodeExtension"
import { HorizontalRule } from "@/features/editor/components/nodes/HorizontalRuleNode/HorizontalRuleNodeExtension"
import { CodeBlockNode } from "@/features/editor/components/nodes/CodeBlockNode/CodeBlockNodeExtension"
import { TaskItemNode } from "@/features/editor/components/nodes/TaskItemNode/TaskItemNodeExtension"
import { HeadingNode } from "@/features/editor/components/nodes/HeadingNode/HeadingNodeExtension"

// --- Tiptap Features ---
import { SlashCommandExtension } from "@/features/editor/components/extensions/SlashCommand/SlashCommandExtension"

// --- Tiptap Columns ---
import { ColumnsExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnsExtension"
import { ColumnExtension } from "@/features/editor/components/nodes/ColumnsNode/ColumnExtension"

// --- Tiptap Layouts ---
import { CardNodeExtension } from "@/features/editor/components/nodes/CardNode/CardNodeExtension"
import { AccordionNodeExtension } from "@/features/editor/components/nodes/AccordionNode/AccordionNodeExtension"

// --- Tiptap UI Hooks & Components ---
import { BlockDragHandle } from "@/features/editor/components/editor-ui/BlockDragHandle"
import { EditorBubbleMenu } from "@/features/editor/components/editor-ui/EditorBubbleMenu"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/features/editor/utils/tiptapUtils"
import { EDITOR_STORAGE_KEY } from "@/features/editor/constants/editor.constants"
import { IS_BROWSER } from "@/lib/utils"

import content from "@/features/editor/components/data/content.json"

export function DocumentEditor() {
  const getInitialContent = () => {
    if (IS_BROWSER) {
      const saved = localStorage.getItem(EDITOR_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Graceful fallback to default content if parsing fails
        }
      }
    }
    return content;
  };

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
            class: "mt-6 border-l-2 border-l-border pl-6 italic text-muted-foreground outline-none",
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
        HTMLAttributes: { class: "my-6 ml-6 list-none [&>li]:mt-2 outline-none" },
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
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(json));
    },
  })

  return (
    <div className="w-full h-full overflow-auto bg-background text-foreground font-sans group relative">
      <div className="w-full mx-auto h-full flex flex-col pl-14 pr-6 sm:pl-24 sm:pr-12 pt-16 pb-96">
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
  )
}
