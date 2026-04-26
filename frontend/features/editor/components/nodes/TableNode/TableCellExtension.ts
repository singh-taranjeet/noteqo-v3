import { TableCell } from "@tiptap/extension-table-cell";

/**
 * Extends the official @tiptap/extension-table-cell with a custom
 * `backgroundColor` attribute for cell/column coloring via the context menu.
 */
export const TableCellExtension = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});
