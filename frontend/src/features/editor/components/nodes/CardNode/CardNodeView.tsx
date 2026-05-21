import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { Card, CardContent } from "@/components/ui/card";

const THEMES: Record<string, string> = {
  default: "bg-background text-foreground",
  muted: "bg-muted text-muted-foreground",
  blue: "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-900",
  green:
    "bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-100 border-green-200 dark:border-green-900",
  yellow:
    "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-900",
  red: "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100 border-red-200 dark:border-red-900",
};

export const CardNodeView = ({ node }: NodeViewProps) => {
  const colorTheme = (node.attrs.colorTheme as string) || "default";
  const activeClass = THEMES[colorTheme] || THEMES.default;

  return (
    <NodeViewWrapper className="w-full my-4 block not-prose">
      <div className="relative group/card">
        {/* Since we can't reliably guess where 'cn' is, I'll just template literal the strings */}
        <Card className={`transition-colors overflow-hidden ${activeClass}`}>
          <CardContent className="w-full">
            <NodeViewContent className="min-h-[1.5em] prose dark:prose-invert max-w-none w-full [&>p]:m-0" />
          </CardContent>
        </Card>
      </div>
    </NodeViewWrapper>
  );
};
