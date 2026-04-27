"use client";

import { useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { mediaService } from "@/features/media/services/media.service";
import { logService } from "@/services/log.service";
import { DownloadIcon } from "@/features/editor/components/icons/DownloadIcon";
import { FileIcon } from "@/features/editor/components/icons/FileIcon";
import { SpinnerIcon } from "@/features/editor/components/icons/SpinnerIcon";
import "./EncryptedFileAttachmentNode.scss";

export const EncryptedFileAttachmentNode = (props: NodeViewProps) => {
  const { src, filename, sizeBytes } = props.node.attrs;
  const spaceId = props.extension.options.spaceId;
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    if (!src || isDownloading) return;

    if (!spaceId) {
      logService.warn("No spaceId provided to EncryptedFileAttachmentNode, cannot decrypt.");
      setError(true);
      return;
    }

    setIsDownloading(true);
    setError(false);

    try {
      // 1. Fetch and decrypt the file
      const decryptedUrl = await mediaService.getDecryptedMediaUrl(src, spaceId);

      // 2. Programmatically click a link to download it
      const a = document.createElement("a");
      a.href = decryptedUrl;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 3. Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(decryptedUrl), 1000);
    } catch (err) {
      logService.error("Failed to decrypt file attachment", err);
      setError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <NodeViewWrapper
      className={`tiptap-file-attachment ${props.selected ? "ProseMirror-selectednode" : ""}`}
      data-drag-handle
      onClick={handleDownload}
    >
      <div className="tiptap-file-attachment-icon-container">
        <FileIcon />
      </div>
      <div className="tiptap-file-attachment-info">
        <span className="tiptap-file-attachment-filename">
          {filename || "Unknown File"}
        </span>
        <span className="tiptap-file-attachment-meta">
          {formatFileSize(sizeBytes)} {error && "• Failed to decrypt"}
        </span>
      </div>
      <div className="tiptap-file-attachment-actions">
        {isDownloading ? (
          <SpinnerIcon className="tiptap-file-attachment-spinner" />
        ) : (
          <DownloadIcon className="tiptap-file-attachment-download-icon" />
        )}
      </div>
    </NodeViewWrapper>
  );
};
