"use client";
import { Image as ImageIcon, Smile } from "lucide-react";

import { EditorContent, EditorContext } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import type { ChangeEvent, FocusEvent } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { BlockDragHandle } from "@/features/editor/components/editor-ui/BlockDragHandle";
import { EditorBubbleMenu } from "@/features/editor/components/editor-ui/EditorBubbleMenu";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { MediaPicker } from "@/features/media/components/MediaPicker";
import { EncryptedImage } from "@/features/media/components/EncryptedImage";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useCallback } from "react";
import type { DecryptedMedia } from "@/features/media/types/media.types";

interface MediaHoverCardProps {
  type: "cover" | "emoji";
  spaceId: string;
  noteId: string;
  onSelect: (value: string) => void;
  children: React.ReactNode;
  align?: "center" | "start" | "end";
}

function MediaHoverCard({
  type,
  spaceId,
  noteId,
  onSelect,
  children,
  align = "start",
}: MediaHoverCardProps) {
  const [open, setOpen] = useState(false);

  const triggerWithClick = React.isValidElement(children)
    ? React.cloneElement(
      children as React.ReactElement<{
        onClick?: (e: React.MouseEvent) => void;
      }>,
      {
        onClick: (e: React.MouseEvent) => {
          setOpen(true);
          const originalOnClick = (
            children as React.ReactElement<{
              onClick?: (e: React.MouseEvent) => void;
            }>
          ).props.onClick;
          if (originalOnClick) originalOnClick(e);
        },
      },
    )
    : children;

  return (
    <HoverCard
      openDelay={100}
      closeDelay={100}
      open={open}
      onOpenChange={setOpen}
    >
      <HoverCardTrigger asChild>{triggerWithClick}</HoverCardTrigger>
      <HoverCardContent
        align={align}
        className="w-auto p-0 shadow-xl overflow-hidden bg-glass border-white/10"
      >
        <MediaPicker
          type={type}
          spaceId={spaceId}
          noteId={noteId}
          onSelect={(url) => {
            onSelect(url);
            setOpen(false);
          }}
        />
      </HoverCardContent>
    </HoverCard>
  );
}

interface NoteEditorSurfaceProps {
  editor: Editor;
  title?: string;
  emoji: string;
  coverImage: string;
  isReadOnly: boolean;
  isTrashed?: boolean;
  onTitleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  className?: string;
  contentWrapperClassName?: string;
  spaceId?: string;
  noteId?: string;
  onUpdateCoverImage?: (url: string) => void;
  onUpdateEmoji?: (value: string) => void;
}

export function NoteEditorSurface({
  editor,
  title = "",
  emoji,
  coverImage,
  isReadOnly,
  isTrashed,
  onTitleChange,
  onTitleBlur,
  className,
  contentWrapperClassName,
  spaceId,
  noteId,
  onUpdateCoverImage,
  onUpdateEmoji,
}: Readonly<NoteEditorSurfaceProps>) {
  const [mediaPickerState, setMediaPickerState] = useState<{
    open: boolean;
    accept?: string;
  }>({ open: false });

  useEffect(() => {
    const handlePromptMediaPicker = (e: Event) => {
      const customEvent = e as CustomEvent<{ accept?: string }>;
      setMediaPickerState({ open: true, accept: customEvent.detail?.accept });
    };

    window.addEventListener(
      "noteqo:prompt-media-picker",
      handlePromptMediaPicker,
    );
    return () => {
      window.removeEventListener(
        "noteqo:prompt-media-picker",
        handlePromptMediaPicker,
      );
    };
  }, []);

  const handleAttachmentSelect = useCallback(
    (url: string, asset?: DecryptedMedia) => {
      if (!asset) return; // Handled by onFileSelect if uploaded directly

      const isVideo = asset.mimeType?.startsWith("video/");
      const nodeType = isVideo ? "encryptedVideo" : "encryptedImage";

      editor
        .chain()
        .focus()
        .insertContent({
          type: nodeType,
          attrs: {
            url: asset.url,
            fileName: asset.title || "Asset",
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            spaceId: spaceId,
          },
        })
        .run();

      setMediaPickerState({ open: false });
    },
    [editor, spaceId],
  );

  const handleAttachmentFileSelect = useCallback(
    (file: File) => {
      const pos = editor.state.selection.from;
      const fileUploaderStorage = (editor.storage as Record<string, any>)
        .fileUploader as {
          handleUpload?: (file: File, pos: number) => void;
        };

      if (fileUploaderStorage?.handleUpload) {
        fileUploaderStorage.handleUpload(file, pos);
      }
      setMediaPickerState({ open: false });
    },
    [editor],
  );

  return (
    <div
      className={cn(
        "group relative flex h-full w-full flex-col overflow-auto bg-background font-sans text-foreground",
        className,
      )}
    >
      {isTrashed && (
        <div className="w-full bg-destructive/10 text-destructive text-sm font-medium p-3 text-center border-b border-destructive/20 shrink-0">
          This note is in the Trash and is currently read-only.
        </div>
      )}

      {coverImage ? (
        <div className="group/cover relative h-[25vh] shrink-0 sm:h-[30vh]">
          <EncryptedImage
            src={coverImage}
            alt="Cover"
            spaceId={spaceId}
            className="h-full w-full object-cover"
          />
          {!isReadOnly && spaceId && noteId && onUpdateCoverImage && (
            <div className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover/cover:opacity-100">
              <MediaHoverCard
                type="cover"
                spaceId={spaceId}
                noteId={noteId}
                align="end"
                onSelect={onUpdateCoverImage}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Change Cover
                </Button>
              </MediaHoverCard>
            </div>
          )}
        </div>
      ) : null}

      <div
        className={cn(
          "relative mx-auto mb-96 flex w-full max-w-4xl flex-1 flex-col px-6 sm:px-24",
          contentWrapperClassName,
        )}
      >
        <div className="mt-8 mb-6 relative group/header">
          {!isReadOnly &&
            spaceId &&
            noteId &&
            !coverImage &&
            onUpdateCoverImage && (
              <div className="absolute -top-6 left-0 opacity-0 transition-opacity group-hover/header:opacity-100">
                <MediaHoverCard
                  type="cover"
                  spaceId={spaceId}
                  noteId={noteId}
                  onSelect={onUpdateCoverImage}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Add Cover
                  </Button>
                </MediaHoverCard>
              </div>
            )}

          {emoji ? (
            <div className="relative z-10 mb-4 -mt-14 w-fit group/emoji">
              {emoji.length > 2 && emoji.startsWith("http") ? (
                <EncryptedImage
                  src={emoji}
                  alt="Icon"
                  spaceId={spaceId}
                  className={cn("size-18 object-cover rounded-md")}
                />
              ) : (
                <div className="text-7xl leading-none">{emoji}</div>
              )}

              {!isReadOnly && spaceId && noteId && onUpdateEmoji && (
                <div className="absolute -right-8 bottom-0 opacity-0 transition-opacity group-hover/emoji:opacity-100">
                  <MediaHoverCard
                    type="emoji"
                    spaceId={spaceId}
                    noteId={noteId}
                    onSelect={onUpdateEmoji}
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-background/80 shadow-sm backdrop-blur-sm"
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                  </MediaHoverCard>
                </div>
              )}
            </div>
          ) : (
            !isReadOnly &&
            spaceId &&
            noteId &&
            onUpdateEmoji && (
              <div className="absolute -top-6 left-28 opacity-0 transition-opacity group-hover/header:opacity-100">
                <MediaHoverCard
                  type="emoji"
                  spaceId={spaceId}
                  noteId={noteId}
                  onSelect={onUpdateEmoji}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Smile className="mr-2 h-4 w-4" />
                    Add Icon
                  </Button>
                </MediaHoverCard>
              </div>
            )
          )}

          <Input
            type="text"
            className={`w-full rounded-none! px-0! border-none bg-transparent text-4xl! font-bold text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 !sm:text-5xl ${isReadOnly ? "!pointer-events-none" : ""}`}
            value={title}
            onChange={onTitleChange}
            onBlur={onTitleBlur}
            placeholder={"Note title"}
            readOnly={isReadOnly}
            maxLength={50}
          />
        </div>

        <EditorContext.Provider value={{ editor }}>
          {!isReadOnly ? <BlockDragHandle editor={editor} /> : null}
          {!isReadOnly ? <EditorBubbleMenu editor={editor} /> : null}
          <EditorContent
            editor={editor}
            role="presentation"
            className={cn("flex-1 w-full")}
          />
        </EditorContext.Provider>
      </div>
      <Dialog
        open={mediaPickerState.open}
        onOpenChange={(open) =>
          setMediaPickerState((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="p-0 border-white/10 bg-glass max-w-min shadow-xl overflow-hidden">
          <DialogTitle className="sr-only">Select Media</DialogTitle>
          {spaceId && noteId && (
            <MediaPicker
              type="attachment"
              spaceId={spaceId}
              noteId={noteId}
              accept={mediaPickerState.accept}
              onSelect={handleAttachmentSelect}
              onFileSelect={handleAttachmentFileSelect}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
