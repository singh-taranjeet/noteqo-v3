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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Tiptap mergeAttributes requires Record<string, any>
  renderHTML({ HTMLAttributes }: Record<string, any>) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "shadcn-accordion" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AccordionNodeView);
  },
});
