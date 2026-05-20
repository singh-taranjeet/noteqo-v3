import { Download, FileText, Link, Trash2 } from "lucide-react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import React, { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { mediaService } from "@/features/media";
import { logService } from "@/services/log.service";
import { cn } from "@/lib/utils";
import { resolveSpaceId } from "@/features/editor/utils/editor-space.utils";

const REVOKE_URL_DELAY_MS = 10_000;

export const FileNodeView: React.FC<NodeViewProps> = (props) => {
  const { node, editor } = props;
  const { url, fileName, mimeType, sizeBytes, uploading } = node.attrs;

  const [isDecrypting, setIsDecrypting] = useState(false);

  const spaceId = resolveSpaceId(
    editor,
    node.attrs.spaceId as string | undefined,
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleAction = async (action: "download" | "open") => {
    if (!url || !spaceId) {
      logService.error(
        `[browser] Missing URL or Space ID for decryption. url=${String(url)}, spaceId=${String(spaceId)}`,
      );
      return;
    }

    try {
      setIsDecrypting(true);
      const blob = await mediaService.fetchAndDecryptMedia(
        url,
        spaceId,
        mimeType || "application/octet-stream",
      );

      const objectUrl = URL.createObjectURL(blob);

      if (action === "download") {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName || "downloaded-file";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        window.open(objectUrl, "_blank");
      }

      // Cleanup object URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, REVOKE_URL_DELAY_MS);
    } catch (err) {
      logService.error("Failed to decrypt and open file", err);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <>
      {/* semantic hook class for drag-handle targeting, not a Tailwind class */}
      <NodeViewWrapper className="file-attachment-node my-4" data-drag-handle>
        <div
          className={cn(
            "flex items-center justify-between p-3 border rounded-md bg-card shadow-sm transition-all duration-200",
            uploading ? "opacity-70 animate-pulse" : "",
          )}
          contentEditable={false}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {uploading ? (
                <Spinner className="w-6 h-6" />
              ) : (
                <FileText size={24} />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm  truncate max-w-48 sm:max-w-72">
                {fileName || "Unknown File"}
              </span>
              <span className="text-xs text-muted-foreground">
                {uploading
                  ? "Encrypting and uploading..."
                  : sizeBytes
                    ? formatBytes(sizeBytes)
                    : "Unknown size"}
              </span>
            </div>
          </div>

          {!uploading && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => props.deleteNode()}
                title="Remove from note"
              >
                <Trash2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleAction("open")}
                disabled={isDecrypting}
                title="Open in new tab"
              >
                <Link size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleAction("download")}
                disabled={isDecrypting}
                title="Download file"
              >
                {isDecrypting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Download size={16} />
                )}
              </Button>
            </div>
          )}
        </div>
      </NodeViewWrapper>
    </>
  );
};
