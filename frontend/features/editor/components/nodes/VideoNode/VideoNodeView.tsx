import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import React, { useRef } from "react";
import { CameraVideoIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { resolveSpaceId } from "@/features/editor/utils/resolveSpaceId";
import { useDecryptMedia } from "@/features/editor/hooks/useDecryptMedia";
import { useMediaResize } from "@/features/editor/hooks/useMediaResize";
import { MediaAlignmentToolbar } from "@/features/editor/components/nodes/shared/MediaAlignmentToolbar";
import {
  MediaLoadingPlaceholder,
  MediaErrorPlaceholder,
} from "@/features/editor/components/nodes/shared/MediaPlaceholder";

const REVOKE_URL_DELAY_MS = 30_000;
const MIN_RESIZE_WIDTH = 200;

export const VideoNodeView: React.FC<NodeViewProps> = (props) => {
  const { node, editor, updateAttributes, selected } = props;
  const { url, mimeType, uploading, spaceId, align, width } = node.attrs;

  const currentSpaceId = resolveSpaceId(editor, spaceId as string | undefined);

  const { objectUrl, isDecrypting } = useDecryptMedia({
    url: url as string | undefined,
    spaceId: currentSpaceId,
    mimeType: mimeType as string | undefined,
    defaultMimeType: "video/mp4",
    uploading: Boolean(uploading),
    revokeDelayMs: REVOKE_URL_DELAY_MS,
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const { isResizing, handleMouseDown } = useMediaResize({
    mediaRef: videoRef,
    align: align as string | undefined,
    updateAttributes,
    minWidth: MIN_RESIZE_WIDTH,
  });

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
          <MediaLoadingPlaceholder
            message={
              uploading
                ? "Encrypting and uploading video..."
                : "Decrypting video..."
            }
          />
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
              <MediaAlignmentToolbar
                align={(align as string) || "center"}
                onAlignChange={setAlign}
              />
            )}
          </>
        ) : (
          <MediaErrorPlaceholder
            icon={CameraVideoIcon}
            message="Failed to load video"
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};
