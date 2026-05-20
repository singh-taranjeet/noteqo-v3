import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AccordionNodeView } from "./AccordionNodeView";

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
    return ReactNodeViewRenderer(withBlockWrapper(AccordionNodeView));
  },
});
