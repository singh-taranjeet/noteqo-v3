import { Table } from "@tiptap/extension-table";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TableNodeView } from "./TableNodeView";

/**
 * Noteqo Table extension — extends the official @tiptap/extension-table
 * with column resizing enabled and a custom React NodeView for
 * Notion-like interactive controls (add row/column, column drag, context menu).
 */
export const TableNodeExtension = Table.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TableNodeView);
  },
}).configure({
  resizable: true,
  cellMinWidth: 100,
  lastColumnResizable: true,
  allowTableNodeSelection: false,
  HTMLAttributes: {
    class: "noteqo-table",
  },
});
