import {
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

export const CalloutNodeView = (props: NodeViewProps) => {
  const { node, selected, updateAttributes, editor } = props;
  const { emoji, variant } = node.attrs;

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-900 dark:text-yellow-200";
      case "danger":
        return "bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-200";
      case "success":
        return "bg-green-500/10 border-green-500/20 text-green-900 dark:text-green-200";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200";
    }
  };

  const getVariantIcon = () => {
    if (emoji) return <span className="text-xl leading-none">{emoji}</span>;
    switch (variant) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "danger":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <NodeViewWrapper className="my-4">
      <div
        className={cn(
          "w-full rounded-lg border p-4 flex gap-4 transition-all",
          getVariantStyles(),
          selected ? "ring-2 ring-primary/50" : "",
        )}
      >
        <div
          contentEditable={false}
          className="select-none flex-shrink-0 mt-0.5"
        >
          {editor.isEditable ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none hover:bg-black/5 dark:hover:bg-white/10 p-1 -m-1 rounded transition-colors inline-flex items-center justify-center">
                {getVariantIcon()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() =>
                    updateAttributes({ variant: "info", emoji: "💡" })
                  }
                >
                  <span className="mr-2">💡</span> Info
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateAttributes({ variant: "success", emoji: "✅" })
                  }
                >
                  <span className="mr-2">✅</span> Success
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateAttributes({ variant: "warning", emoji: "⚠️" })
                  }
                >
                  <span className="mr-2">⚠️</span> Warning
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateAttributes({ variant: "danger", emoji: "🚨" })
                  }
                >
                  <span className="mr-2">🚨</span> Danger
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="p-1 -m-1 inline-flex items-center justify-center">
              {getVariantIcon()}
            </div>
          )}
        </div>
        <NodeViewContent className="flex-1 callout-content text-[0.95rem] leading-normal [&>p:first-child]:mt-0 [&>p:last-child]:mb-0" />
      </div>
    </NodeViewWrapper>
  );
};
