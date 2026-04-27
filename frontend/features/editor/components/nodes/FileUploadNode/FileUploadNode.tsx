"use client";

import { useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/features/editor/components/icons/CloseIcon";
import { FileIcon } from "@/features/editor/components/icons/FileIcon";
import {
  focusNextNode,
  isValidPosition,
} from "@/features/editor/utils/tiptapUtils";

// Re-using the same useFileUpload hook logic for simplicity
export interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  url?: string;
  abortController?: AbortController;
}

export interface UploadOptions {
  maxSize: number;
  limit: number;
  accept: string;
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal,
  ) => Promise<string>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

function useFileUpload(options: UploadOptions) {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);

  const uploadFile = async (
    file: File,
  ): Promise<{ url: string; file: File } | null> => {
    if (file.size > options.maxSize) {
      options.onError?.(
        new Error(
          `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`,
        ),
      );
      return null;
    }

    const abortController = new AbortController();
    const fileId = crypto.randomUUID();

    const newFileItem: FileItem = {
      id: fileId,
      file,
      progress: 0,
      status: "uploading",
      abortController,
    };

    setFileItems((prev) => [...prev, newFileItem]);

    try {
      if (!options.upload) throw new Error("Upload function is not defined");

      const url = await options.upload(
        file,
        (event) => {
          setFileItems((prev) =>
            prev.map((item) =>
              item.id === fileId ? { ...item, progress: event.progress } : item,
            ),
          );
        },
        abortController.signal,
      );

      if (!url) throw new Error("Upload failed: No URL returned");

      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "success", url, progress: 100 }
              : item,
          ),
        );
        options.onSuccess?.(url);
        return { url, file };
      }

      return null;
    } catch (error) {
      if (!abortController.signal.aborted) {
        setFileItems((prev) =>
          prev.map((item) =>
            item.id === fileId
              ? { ...item, status: "error", progress: 0 }
              : item,
          ),
        );
        options.onError?.(
          error instanceof Error ? error : new Error("Upload failed"),
        );
      }
      return null;
    }
  };

  const uploadFiles = async (
    files: File[],
  ): Promise<{ url: string; file: File }[]> => {
    if (!files || files.length === 0) return [];
    if (options.limit && files.length > options.limit) {
      options.onError?.(new Error(`Maximum ${options.limit} files allowed`));
      return [];
    }

    const uploadPromises = files.map((file) => uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return results.filter(
      (res): res is { url: string; file: File } => res !== null,
    );
  };

  const removeFileItem = (fileId: string) => {
    setFileItems((prev) => {
      const fileToRemove = prev.find((item) => item.id === fileId);
      if (fileToRemove?.abortController) fileToRemove.abortController.abort();
      return prev.filter((item) => item.id !== fileId);
    });
  };

  const clearAllFiles = () => {
    fileItems.forEach((item) => {
      if (item.abortController) item.abortController.abort();
    });
    setFileItems([]);
  };

  return { fileItems, uploadFiles, removeFileItem, clearAllFiles };
}

const FileUploadDragArea: React.FC<{
  onFile: (files: File[]) => void;
  children?: React.ReactNode;
}> = ({ onFile, children }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFile(files);
  };

  return (
    <div
      className={`tiptap-image-upload-drag-area ${isDragActive ? "drag-active" : ""} ${isDragOver ? "drag-over" : ""}`}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragActive(false);
          setIsDragOver(false);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export const FileUploadNode: React.FC<NodeViewProps> = (props) => {
  const { accept, limit, maxSize } = props.node.attrs;
  const inputRef = useRef<HTMLInputElement>(null);
  const extension = props.extension;

  const uploadOptions: UploadOptions = {
    maxSize,
    limit,
    accept,
    upload: extension.options.upload,
    onSuccess: extension.options.onSuccess,
    onError: extension.options.onError,
  };

  const { fileItems, uploadFiles, removeFileItem, clearAllFiles } =
    useFileUpload(uploadOptions);

  const handleUpload = async (files: File[]) => {
    const results = await uploadFiles(files);

    if (results.length > 0) {
      const pos = props.getPos();

      if (isValidPosition(pos)) {
        const fileNodes = results.map(({ url, file }) => {
          return {
            type: extension.options.type, // 'fileAttachment'
            attrs: {
              src: url,
              filename: file.name,
              filetype: file.name.split(".").pop()?.toUpperCase() || "FILE",
            },
          };
        });

        props.editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + props.node.nodeSize })
          .insertContentAt(pos, fileNodes)
          .run();

        focusNextNode(props.editor);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleUpload(Array.from(files));
  };

  const hasFiles = fileItems.length > 0;

  return (
    <NodeViewWrapper
      className="tiptap-image-upload"
      tabIndex={0}
      onClick={() => {
        if (inputRef.current && !hasFiles) inputRef.current.click();
      }}
    >
      {!hasFiles && (
        <FileUploadDragArea onFile={handleUpload}>
          <div className="tiptap-image-upload-dropzone">
            <div className="tiptap-image-upload-icon-container">
              <FileIcon />
            </div>
          </div>
          <div className="tiptap-image-upload-content">
            <span className="tiptap-image-upload-text">
              <em>Click to upload</em> or drag and drop any file
            </span>
            <span className="tiptap-image-upload-subtext">
              Max {maxSize / 1024 / 1024}MB.
            </span>
          </div>
        </FileUploadDragArea>
      )}

      {hasFiles && (
        <div className="tiptap-image-upload-previews">
          {fileItems.map((fileItem) => (
            <div key={fileItem.id} className="tiptap-image-upload-preview">
              {fileItem.status === "uploading" && (
                <div
                  className="tiptap-image-upload-progress"
                  style={{ width: `${fileItem.progress}%` }}
                />
              )}
              <div className="tiptap-image-upload-preview-content">
                <div className="tiptap-image-upload-file-info">
                  <div className="tiptap-image-upload-file-icon">
                    <FileIcon />
                  </div>
                  <div className="tiptap-image-upload-details">
                    <span className="tiptap-image-upload-text">
                      {fileItem.file.name}
                    </span>
                    <span className="tiptap-image-upload-subtext">
                      {fileItem.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        name="file"
        accept={accept}
        type="file"
        multiple={limit > 1}
        onChange={handleChange}
        onClick={(e) => e.stopPropagation()}
        style={{ display: "none" }}
      />
    </NodeViewWrapper>
  );
};
