import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const EmbedNodeView = (props: NodeViewProps) => {
  const { node, selected } = props;
  const url = node.attrs.url;

  // Transform raw URLs into embeddable ones if possible
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    try {
      const urlObj = new URL(rawUrl);
      if (
        urlObj.hostname.includes("youtube.com") &&
        urlObj.searchParams.has("v")
      ) {
        return `https://www.youtube.com/embed/${urlObj.searchParams.get("v")}`;
      }
      if (urlObj.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed${urlObj.pathname}`;
      }
      if (urlObj.hostname.includes("vimeo.com")) {
        return `https://player.vimeo.com/video${urlObj.pathname}`;
      }
      if (urlObj.hostname.includes("figma.com")) {
        return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(rawUrl)}`;
      }
      return rawUrl;
    } catch {
      return rawUrl;
    }
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <NodeViewWrapper className="my-4">
      <Card
        className={cn(
          "w-full overflow-hidden transition-all p-0",
          selected ? "ring-2 ring-primary" : "hover:border-primary/50",
        )}
      >
        <div className="relative w-full aspect-video bg-muted flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <span className="text-muted-foreground text-sm">
              No URL provided
            </span>
          )}
        </div>
      </Card>
    </NodeViewWrapper>
  );
};
