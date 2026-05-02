import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  ExpandIcon,
  CameraVideoIcon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { mediaService } from "@/features/media";
import { logService } from "@/services/log.service";
import { cn } from "@/lib/utils";

const REVOKE_URL_DELAY_MS = 30_000;

export const VideoNodeView: React.FC<NodeViewProps> = (props) => {
  const { node, editor, updateAttributes, selected } = props;
  const { url, mimeType, uploading, spaceId, align, width } = node.attrs;

  const [isDecrypting, setIsDecrypting] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Fallback for spaceId if not present in attributes
  let currentSpaceId = spaceId;
  if (!currentSpaceId) {
    const fileUploaderExt = editor.extensionManager.extensions.find(
      (e) => e.name === "fileUploader",
    );
    currentSpaceId = fileUploaderExt?.options.getSpaceId?.();
  }

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    const decryptVideo = async () => {
      if (uploading || !url || !currentSpaceId) return;

      try {
        setIsDecrypting(true);
        const blob = await mediaService.fetchAndDecryptMedia(
          url as string,
          currentSpaceId as string,
          (mimeType as string) || "video/mp4",
        );

        if (active) {
          createdUrl = URL.createObjectURL(blob);
          setObjectUrl(createdUrl);
        }
      } catch (err) {
        logService.error("Failed to decrypt video", err);
      } finally {
        if (active) {
          setIsDecrypting(false);
        }
      }
    };

    void decryptVideo();

    return () => {
      active = false;
      if (createdUrl) {
        // Longer delay for video to allow buffered playback to finish
        setTimeout(
          () => URL.revokeObjectURL(createdUrl as string),
          REVOKE_URL_DELAY_MS,
        );
      }
    };
  }, [url, currentSpaceId, uploading, mimeType]);

  const setAlign = (newAlign: "left" | "center" | "right" | "full") => {
    updateAttributes({ align: newAlign });
  };

  const alignClass =
    {
      left: "mr-auto",
      center: "mx-auto",
      right: "ml-auto",
      full: "w-full",
    }[align as string] || "mx-auto";

  // Basic drag to resize implementation
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeState, setResizeState] = useState({ startX: 0, startWidth: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    if (videoRef.current && videoRef.current.parentElement) {
      setResizeState({
        startX: e.clientX,
        startWidth:
          videoRef.current.parentElement.getBoundingClientRect().width,
      });
    }
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeState.startX;
      let newWidth = resizeState.startWidth;

      if (align === "center") {
        newWidth = resizeState.startWidth + deltaX * 2;
      } else if (align === "right") {
        newWidth = resizeState.startWidth - deltaX;
      } else {
        newWidth = resizeState.startWidth + deltaX;
      }

      newWidth = Math.max(200, newWidth);
      updateAttributes({ width: `${newWidth}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, align, resizeState, updateAttributes]);

  return (
    <NodeViewWrapper
      className={cn(
        "video-attachment-node my-4 flex w-full relative group",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
      )}
      data-drag-handle
    >
      <div
        className={cn(
          "relative border border-transparent rounded-lg transition-all duration-200 inline-block overflow-hidden",
          selected
            ? "ring-2 ring-primary/20 border-primary"
            : "hover:border-primary/50",
          alignClass,
          align === "full" ? "w-full" : "",
        )}
        style={{ width: align === "full" ? "100%" : (width as string) }}
      >
        {uploading || isDecrypting ? (
          <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg min-h-[200px] w-full border border-dashed">
            <Spinner className="w-8 h-8 text-muted-foreground mb-4" />
            <span className="text-sm text-muted-foreground">
              {uploading
                ? "Encrypting and uploading video..."
                : "Decrypting video..."}
            </span>
          </div>
        ) : objectUrl ? (
          <>
            <video
              ref={videoRef}
              src={objectUrl}
              controls
              playsInline
              preload="metadata"
              controlsList="nodownload"
              className="block max-w-full h-auto rounded-lg bg-black"
              style={{
                width: "100%",
                userSelect: "none",
                pointerEvents: isResizing ? "none" : "auto",
              }}
            >
              <track kind="captions" />
              Your browser does not support the video element.
            </video>

            {/* Resize handle */}
            {selected && align !== "full" && (
              <div
                className={cn(
                  "absolute top-0 bottom-0 w-3 cursor-col-resize hover:bg-primary/50 transition-colors z-10 flex items-center justify-center group-hover:bg-primary/20",
                  align === "right" ? "left-0" : "right-0",
                )}
                onMouseDown={handleMouseDown}
              >
                <div className="h-8 w-1 bg-primary/50 rounded-full" />
              </div>
            )}

            {/* Toolbar - only visible when selected */}
            {selected && (
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-sm p-1 z-20">
                <ToggleGroup
                  type="single"
                  value={(align as string) || "center"}
                  onValueChange={(value) => {
                    if (value)
                      setAlign(value as "left" | "center" | "right" | "full");
                  }}
                  className="gap-1"
                >
                  <ToggleGroupItem
                    value="left"
                    aria-label="Align Left"
                    className="h-7 w-7 p-0"
                  >
                    <HugeiconsIcon icon={TextAlignLeftIcon} size={16} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="center"
                    aria-label="Align Center"
                    className="h-7 w-7 p-0"
                  >
                    <HugeiconsIcon icon={TextAlignCenterIcon} size={16} />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="right"
                    aria-label="Align Right"
                    className="h-7 w-7 p-0"
                  >
                    <HugeiconsIcon icon={TextAlignRightIcon} size={16} />
                  </ToggleGroupItem>
                  <Separator orientation="vertical" className="h-4 mx-0.5" />
                  <ToggleGroupItem
                    value="full"
                    aria-label="Full Width"
                    className="h-7 w-7 p-0"
                  >
                    <HugeiconsIcon icon={ExpandIcon} size={16} />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-destructive/10 rounded-lg min-h-[200px] w-full text-destructive border border-destructive/20">
            <HugeiconsIcon
              icon={CameraVideoIcon}
              className="mb-2 opacity-50"
              size={32}
            />
            <span className="text-sm">Failed to load video</span>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
