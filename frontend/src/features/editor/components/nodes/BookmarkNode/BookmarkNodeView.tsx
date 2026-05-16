import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link2 } from "lucide-react";

export const BookmarkNodeView = (props: NodeViewProps) => {
  const { node, selected } = props;
  const url = node.attrs.url as string;

  const getDomain = (rawUrl: string) => {
    if (!rawUrl) return "";
    try {
      const u = new URL(rawUrl);
      return u.hostname;
    } catch {
      return rawUrl;
    }
  };

  const domain = getDomain(url);

  return (
    <NodeViewWrapper className="my-4">
      <Card
        className={cn(
          "w-full overflow-hidden transition-all p-0",
          selected
            ? "ring-2 ring-primary border-primary"
            : "hover:border-primary/50",
        )}
      >
        <a
          href={url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row w-full no-underline text-foreground cursor-pointer"
        >
          <div className="flex-1 p-4 flex flex-col justify-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="w-4 h-4" />
              <span className="truncate max-w-[200px]">
                {domain || "Unknown Domain"}
              </span>
            </div>
            <div className="font-medium truncate" title={url}>
              {url || "No URL provided"}
            </div>
          </div>
        </a>
      </Card>
    </NodeViewWrapper>
  );
};
