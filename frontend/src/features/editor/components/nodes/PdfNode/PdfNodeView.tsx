import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { resolveSpaceId } from "@/features/editor/utils/editor-space.utils";
import { useDecryptMedia } from "@/features/media";
import {
  MediaLoadingPlaceholder,
  MediaErrorPlaceholder,
} from "@/features/editor/components/nodes/shared/MediaPlaceholder";
import { Button } from "@/components/ui/button";

export const PdfNodeView = (props: NodeViewProps) => {
  const { node, selected, editor } = props;
  const { url, fileName, spaceId, mimeType, uploading } = node.attrs;

  const currentSpaceId = resolveSpaceId(editor, spaceId as string | undefined);

  const { objectUrl, isDecrypting } = useDecryptMedia({
    url: url as string | undefined,
    spaceId: currentSpaceId,
    mimeType: mimeType as string | undefined,
    defaultMimeType: "application/pdf",
    uploading: Boolean(uploading),
    revokeDelayMs: 30000,
  });

  return (
    <NodeViewWrapper className="my-4">
      <Card
        className={cn(
          "w-full gap-0 p-0 overflow-hidden transition-all relative flex flex-col",
          selected
            ? "ring-2 ring-primary border-primary"
            : "hover:border-primary/50",
        )}
      >
        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="font-medium text-sm truncate max-w-[200px] sm:max-w-md">
              {fileName || "Document.pdf"}
            </span>
          </div>
          {objectUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={objectUrl} download={fileName || "Document.pdf"}>
                <Download className="w-4 h-4 mr-2" /> Download
              </a>
            </Button>
          )}
        </div>

        <div className="relative w-full h-[500px] bg-muted/30 flex items-center justify-center">
          {uploading || isDecrypting ? (
            <MediaLoadingPlaceholder
              message={uploading ? "Encrypting PDF..." : "Decrypting PDF..."}
            />
          ) : objectUrl ? (
            <iframe
              src={`${objectUrl}#toolbar=0`}
              className="absolute top-0 left-0 w-full h-full border-0"
              title={fileName || "PDF Document"}
            />
          ) : (
            <MediaErrorPlaceholder
              icon={FileText}
              message="Failed to load PDF"
            />
          )}
        </div>
      </Card>
    </NodeViewWrapper>
  );
};
