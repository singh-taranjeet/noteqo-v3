"use client";

import { EditorContent, EditorContext } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import type { ChangeEvent, FocusEvent } from "react";
import { cn } from "@/lib/utils";
import { BlockDragHandle } from "@/features/editor/components/editor-ui/BlockDragHandle";
import { EditorBubbleMenu } from "@/features/editor/components/editor-ui/EditorBubbleMenu";
import { NOTE_DEFAULTS } from "@/features/workspace/constants/workspace.constants";

interface NoteEditorSurfaceProps {
  editor: Editor;
  title: string;
  emoji: string;
  coverImage: string;
  isReadOnly: boolean;
  onTitleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  contentWrapperClassName?: string;
}

export function NoteEditorSurface({
  editor,
  title,
  emoji,
  coverImage,
  isReadOnly,
  onTitleChange,
  onTitleBlur,
  className,
  contentWrapperClassName,
}: Readonly<NoteEditorSurfaceProps>) {
  return (
    <div
      className={cn(
        "group relative flex h-full w-full flex-col overflow-auto bg-background font-sans text-foreground",
        className,
      )}
    >
      {coverImage ? (
        <div className="group/cover relative h-[25vh] shrink-0 sm:h-[30vh]">
          {/* eslint-disable-next-line @next/next/no-img-element*/}
          <img
            src={coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div
        className={cn(
          "relative mx-auto mb-96 flex w-full max-w-4xl flex-1 flex-col px-6 sm:px-24",
          contentWrapperClassName,
        )}
      >
        <div className="mt-8 mb-6">
          {emoji ? (
            <div className="relative z-10 mb-4 -mt-14 w-fit text-[72px] leading-none">
              {emoji}
            </div>
          ) : null}

          {isReadOnly ? (
            <h1 className="w-full bg-transparent text-4xl font-bold text-foreground sm:text-5xl">
              {title || NOTE_DEFAULTS.TITLE}
            </h1>
          ) : (
            <input
              type="text"
              className="w-full border-none bg-transparent text-4xl font-bold text-foreground outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-5xl"
              value={title || NOTE_DEFAULTS.TITLE}
              onChange={onTitleChange}
              onBlur={onTitleBlur}
              placeholder={NOTE_DEFAULTS.TITLE}
            />
          )}
        </div>

        <EditorContext.Provider value={{ editor }}>
          {!isReadOnly ? <BlockDragHandle editor={editor} /> : null}
          {!isReadOnly ? <EditorBubbleMenu editor={editor} /> : null}
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
