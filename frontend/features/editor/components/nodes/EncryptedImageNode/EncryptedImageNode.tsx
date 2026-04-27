"use client";

import { useEffect, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { mediaService } from "@/features/media/services/media.service";
import { logService } from "@/services/log.service";
import "./EncryptedImageNode.scss";

export const EncryptedImageNode = (props: NodeViewProps) => {
  const { src, alt, title } = props.node.attrs;
  const spaceId = props.extension.options.spaceId;
  const [decryptedSrc, setDecryptedSrc] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    async function loadDecryptedImage() {
      if (!src) return;

      // If it's a base64 data URI or a local object URL, just use it directly
      if (src.startsWith("data:") || src.startsWith("blob:")) {
        setDecryptedSrc(src);
        return;
      }

      // If we don't have a spaceId, we can't decrypt it
      if (!spaceId) {
        logService.warn(
          "No spaceId provided to EncryptedImageNode, cannot decrypt.",
        );
        setError(true);
        return;
      }

      try {
        const url = await mediaService.getDecryptedMediaUrl(src, spaceId);
        if (isMounted) {
          objectUrl = url;
          setDecryptedSrc(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        logService.error("Failed to decrypt image", err);
        if (isMounted) {
          setError(true);
        }
      }
    }

    loadDecryptedImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, spaceId]);

  return (
    <NodeViewWrapper className="tiptap-encrypted-image">
      {decryptedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={decryptedSrc}
          alt={alt || "Decrypted Image"}
          title={title}
          data-drag-handle
          className={props.selected ? "ProseMirror-selectednode" : ""}
        />
      ) : error ? (
        <div className="tiptap-encrypted-image-error">
          <span>Failed to load image</span>
        </div>
      ) : (
        <div className="tiptap-encrypted-image-loading">
          <div className="spinner"></div>
          <span>Decrypting...</span>
        </div>
      )}
    </NodeViewWrapper>
  );
};
