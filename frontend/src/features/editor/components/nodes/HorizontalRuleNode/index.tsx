import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export const HorizontalRuleNodeView = (props: NodeViewProps) => {
  const { node, updateAttributes, editor, selected } = props;
  const variant = node.attrs.variant || "solid";

  return (
    <NodeViewWrapper className="my-8 relative group/divider flex items-center justify-center">
      {editor.isEditable && (
        <div
          className={cn(
            "absolute -top-3 opacity-0 group-hover/divider:opacity-100 transition-opacity z-10 bg-background rounded-md border shadow-sm",
            selected ? "opacity-100" : "",
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 hover:bg-muted rounded focus:outline-none flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-32">
              <DropdownMenuItem
                onClick={() => updateAttributes({ variant: "solid" })}
              >
                Solid
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateAttributes({ variant: "dashed" })}
              >
                Dashed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateAttributes({ variant: "dotted" })}
              >
                Dotted
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateAttributes({ variant: "icon" })}
              >
                Icon (⁂)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {variant === "solid" && (
        <hr
          className={cn(
            "w-full border-t border-border",
            selected && "ring-2 ring-primary/50",
          )}
        />
      )}
      {variant === "dashed" && (
        <hr
          className={cn(
            "w-full border-t-2 border-dashed border-border",
            selected && "ring-2 ring-primary/50",
          )}
        />
      )}
      {variant === "dotted" && (
        <hr
          className={cn(
            "w-full border-t-[3px] border-dotted border-border",
            selected && "ring-2 ring-primary/50",
          )}
        />
      )}
      {variant === "icon" && (
        <div
          className={cn(
            "flex items-center w-full gap-4 px-2",
            selected && "ring-2 ring-primary/50 rounded",
          )}
        >
          <hr className="flex-1 border-t border-border" />
          <span className="text-muted-foreground text-xl select-none">⁂</span>
          <hr className="flex-1 border-t border-border" />
        </div>
      )}
    </NodeViewWrapper>
  );
};
