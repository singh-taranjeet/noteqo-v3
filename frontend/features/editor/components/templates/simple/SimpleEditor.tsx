"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- UI Primitives ---
import { Button } from "@/features/editor/components/ui/Button"
import { Spacer } from "@/features/editor/components/ui/Spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/features/editor/components/ui/Toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/features/editor/components/nodes/ImageUploadNode/ImageUploadNodeExtension"
import { HorizontalRule } from "@/features/editor/components/nodes/HorizontalRuleNode/HorizontalRuleNodeExtension"
import "@/features/editor/components/nodes/BlockquoteNode/BlockquoteNode.scss"
import "@/features/editor/components/nodes/CodeBlockNode/CodeBlockNode.scss"
import "@/features/editor/components/nodes/HorizontalRuleNode/HorizontalRuleNode.scss"
import "@/features/editor/components/nodes/ListNode/ListNode.scss"
import "@/features/editor/components/nodes/ImageNode/ImageNode.scss"
import "@/features/editor/components/nodes/HeadingNode/HeadingNode.scss"
import "@/features/editor/components/nodes/ParagraphNode/ParagraphNode.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/features/editor/components/editor-ui/HeadingDropdownMenu"
import { ImageUploadButton } from "@/features/editor/components/editor-ui/ImageUploadButton"
import { ListDropdownMenu } from "@/features/editor/components/editor-ui/ListDropdownMenu"
import { BlockquoteButton } from "@/features/editor/components/editor-ui/BlockquoteButton"
import { CodeBlockButton } from "@/features/editor/components/editor-ui/CodeBlockButton"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/features/editor/components/editor-ui/ColorHighlightPopover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/features/editor/components/editor-ui/LinkPopover"
import { MarkButton } from "@/features/editor/components/editor-ui/MarkButton"
import { TextAlignButton } from "@/features/editor/components/editor-ui/TextAlignButton"
import { UndoRedoButton } from "@/features/editor/components/editor-ui/UndoRedoButton"

// --- Icons ---
import { ArrowLeftIcon } from "@/features/editor/components/icons/ArrowLeftIcon"
import { HighlighterIcon } from "@/features/editor/components/icons/HighlighterIcon"
import { LinkIcon } from "@/features/editor/components/icons/LinkIcon"

// --- Hooks ---
import { useIsBreakpoint } from "@/features/editor/hooks/useIsBreakpoint"
import { useWindowSize } from "@/features/editor/hooks/useWindowSize"
import { useCursorVisibility } from "@/features/editor/hooks/useCursorVisibility"

// --- Components ---
import { ThemeToggle } from "@/features/editor/components/templates/simple/ThemeToggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/features/editor/utils/tiptapUtils"

// --- Styles ---
import "@/features/editor/components/templates/simple/SimpleEditor.scss"

import content from "@/features/editor/components/templates/simple/data/content.json"

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={["bulletList", "orderedList", "taskList"]}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor() {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const toolbarRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
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
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content,
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
}
