import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";

// ─── Column Item View ─────────────────────────────
function ColumnItemView() {
  return (
    <NodeViewWrapper
      data-column-item="true"
      className="column-item-hover" /* eslint-disable-line tailwindcss/no-custom-classname -- custom editor CSS hook class for column hover styling */
    >
      <NodeViewContent className="min-h-[1.5em] prose dark:prose-invert max-w-none w-full [&>p]:m-0 rounded-md p-2 border border-transparent transition-colors" />
    </NodeViewWrapper>
  );
}

// ─── Column Item Node ─────────────────────────────
export const ColumnExtension = TiptapNode.create({
  name: "column",
  group: "",
  content: "block+",

  parseHTML() {
    return [{ tag: "div[data-type='column-item']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column-item",
        style: "flex: 1; min-width: 0;",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnItemView);
  },
});
