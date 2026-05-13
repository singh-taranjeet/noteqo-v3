import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TableNodeView } from "./TableNodeView";

/**
 * Noteqo custom table extension — a completely custom block node that
 * renders a Notion-like interactive table using React + Tailwind.
 *
 * Does NOT use @tiptap/extension-table. All rendering is handled by
 * TableNodeView via ReactNodeViewRenderer, giving us full control
 * over the DOM and Tailwind classes.
 */
export const TableNodeExtension = TiptapNode.create({
  name: "notionTable",
  group: "block",
  content: "paragraph+",
  isolating: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      /** Serialised table data as JSON string. */
      tableData: {
        default: JSON.stringify({
          headers: ["", "", ""],
          rows: [
            ["", "", ""],
            ["", "", ""],
          ],
          columnWidths: [null, null, null],
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='notion-table']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "notion-table" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableNodeView);
  },
});
