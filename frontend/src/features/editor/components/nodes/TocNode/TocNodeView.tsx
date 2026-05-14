import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ListTree } from "lucide-react";
import { TextSelection } from "prosemirror-state";

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

export const TocNodeView = (props: NodeViewProps) => {
  const { editor, selected } = props;
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  useEffect(() => {
    const updateHeadings = () => {
      const newHeadings: HeadingItem[] = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          newHeadings.push({
            id: pos.toString(),
            level: node.attrs.level,
            text: node.textContent,
            pos: pos,
          });
        }
      });
      setHeadings(newHeadings);
    };

    updateHeadings();

    editor.on("update", updateHeadings);
    return () => {
      editor.off("update", updateHeadings);
    };
  }, [editor]);

  const scrollToHeading = (pos: number) => {
    const view = editor.view;
    const tr = view.state.tr;
    tr.setSelection(TextSelection.create(view.state.doc, pos));
    tr.scrollIntoView();
    view.dispatch(tr);
    view.focus();
  };

  return (
    <NodeViewWrapper className="my-6">
      <div
        className={cn(
          "w-full rounded-lg border bg-muted/30 p-4 transition-all sm:w-3/4 md:w-2/3 lg:max-w-md",
          selected ? "ring-2 ring-primary/50" : "",
        )}
        contentEditable={false}
      >
        <div className="flex items-center gap-2 mb-3 text-muted-foreground font-medium text-sm">
          <ListTree className="w-4 h-4" />
          Table of Contents
        </div>

        {headings.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Add headings to build your table of contents.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={cn(
                  "text-sm cursor-pointer hover:text-primary transition-colors hover:underline underline-offset-4 text-muted-foreground line-clamp-1",
                  heading.level === 1 && "font-semibold text-foreground ml-0",
                  heading.level === 2 && "ml-4",
                  heading.level >= 3 && "ml-8",
                )}
                onClick={() => scrollToHeading(heading.pos)}
              >
                {heading.text || "Untitled Heading"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </NodeViewWrapper>
  );
};
