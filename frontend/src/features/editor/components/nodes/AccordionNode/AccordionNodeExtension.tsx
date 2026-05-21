import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AccordionNodeView } from "./AccordionNodeView";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AccordionNodeExtension = TiptapNode.create({
  name: "shadcnAccordion",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      title: {
        default: "",
      },
      isOpen: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='shadcn-accordion']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "shadcn-accordion" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(
      withBlockWrapper(AccordionNodeView, {
        getCustomUI: (props) => {
          const isOpen = props.node.attrs.isOpen !== false;
          return (
            <Select
              value={isOpen ? "open" : "closed"}
              onValueChange={(v) =>
                props.updateAttributes({ isOpen: v === "open" })
              }
            >
              <SelectTrigger className="h-6 w-24 text-xs bg-background shadow-sm border focus:ring-0">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Expanded</SelectItem>
                <SelectItem value="closed">Collapsed</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      }),
    );
  },
});
