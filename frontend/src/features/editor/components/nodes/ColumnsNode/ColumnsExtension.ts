import {
  Node as TiptapNode,
  mergeAttributes,
  type CommandProps,
} from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ColumnsNodeView } from "./ColumnsNodeView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (cols: number) => ReturnType;
    };
  }
}

export const ColumnsExtension = TiptapNode.create({
  name: "columns",
  group: "block",
  content: "column+",

  addAttributes() {
    return {
      visibleColumns: { default: 2 },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='columns-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "columns-block",
        style: "display: flex; gap: 8px;",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ColumnsNodeView);
  },

  addCommands() {
    return {
      setColumns:
        (cols: number) =>
        ({ commands }: CommandProps) => {
          const visible = cols || 2;
          const items = Array.from({ length: 6 }, () => ({
            type: "column",
            content: [{ type: "paragraph" }],
          }));
          return commands.insertContent({
            type: this.name,
            attrs: { visibleColumns: visible },
            content: items,
          });
        },
    };
  },
});
