import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Music } from "lucide-react";
import { resolveSpaceId } from "@/features/editor/utils/editor-space.utils";
import { useDecryptMedia } from "@/features/media";
import {
  MediaLoadingPlaceholder,
  MediaErrorPlaceholder,
} from "@/features/editor/components/nodes/shared/MediaPlaceholder";

export const AudioNodeView = (props: NodeViewProps) => {
  const { node, selected, editor } = props;
  const { url, fileName, spaceId, mimeType, uploading } = node.attrs;

  const currentSpaceId = resolveSpaceId(editor, spaceId as string | undefined);

  const { objectUrl, isDecrypting } = useDecryptMedia({
    url: url as string | undefined,
    spaceId: currentSpaceId,
    mimeType: mimeType as string | undefined,
    defaultMimeType: "audio/mpeg",
    uploading: Boolean(uploading),
    revokeDelayMs: 30000,
  });

  return (
    <NodeViewWrapper className="my-4">
      <Card
        className={cn(
          "w-full p-0 overflow-hidden transition-all",
          selected
            ? "ring-2 ring-primary border-primary"
            : "hover:border-primary/50",
        )}
      >
        <CardContent className="p-4 flex flex-col gap-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Music className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm truncate">
              {fileName || "Audio Track"}
            </span>
          </div>

          {uploading || isDecrypting ? (
            <div className="h-10 relative overflow-hidden rounded">
              <MediaLoadingPlaceholder
                message={
                  uploading ? "Encrypting audio..." : "Decrypting audio..."
                }
              />
            </div>
          ) : objectUrl ? (
            <audio
              controls
              className="w-full h-10"
              preload="metadata"
              controlsList="nodownload"
            >
              <source src={objectUrl} />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="h-10 relative overflow-hidden rounded">
              <MediaErrorPlaceholder
                icon={Music}
                message="Failed to load audio"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </NodeViewWrapper>
  );
};
