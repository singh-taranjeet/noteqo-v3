import { TableHeader } from "@tiptap/extension-table-header";

/**
 * Extends the official @tiptap/extension-table-header with a custom
 * `backgroundColor` attribute for column coloring via the context menu.
 */
export const TableHeaderExtension = TableHeader.extend({
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
