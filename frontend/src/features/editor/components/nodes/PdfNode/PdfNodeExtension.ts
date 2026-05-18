import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { PdfNodeView } from "./PdfNodeView";

export interface PdfNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pdf: {
      setPdf: (options: {
        url: string;
        fileName?: string;
        mimeType?: string;
        uploading?: boolean;
        spaceId?: string;
      }) => ReturnType;
    };
  }
}

export const PdfNodeExtension = Node.create<PdfNodeOptions>({
  name: "pdf",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "pdf-node",
      },
    };
  },

  addAttributes() {
    return {
      url: { default: null },
      fileName: { default: null },
      mimeType: { default: null },
      uploading: { default: false },
      spaceId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pdf"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "pdf",
      }),
    ];
  },

  addCommands() {
    return {
      setPdf:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfNodeView);
  },
});
