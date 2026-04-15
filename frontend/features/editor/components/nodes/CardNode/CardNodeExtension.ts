import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CardNodeView } from "./CardNodeView";

export const CardNodeExtension = TiptapNode.create({
  name: "shadcnCard",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      colorTheme: {
        default: "default",
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='shadcn-card']" }];
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Tiptap mergeAttributes requires Record<string, any>
  renderHTML({ HTMLAttributes }: Record<string, any>) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "shadcn-card" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CardNodeView);
  },
});
