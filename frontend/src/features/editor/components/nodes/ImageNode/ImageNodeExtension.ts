import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageNodeView } from "./ImageNodeView";

export interface ImageNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    encryptedImage: {
      setEncryptedImage: (options: {
        url?: string;
        fileName?: string;
        mimeType?: string;
        sizeBytes?: number;
        mediaId?: string;
        uploading?: boolean;
        spaceId?: string;
        width?: string;
        align?: "left" | "center" | "right" | "full";
      }) => ReturnType;
    };
  }
}

export const ImageNodeExtension = Node.create<ImageNodeOptions>({
  name: "encryptedImage",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "encrypted-image-node",
      },
    };
  },

  addAttributes() {
    return {
      url: { default: null },
      fileName: { default: null },
      mimeType: { default: null },
      sizeBytes: { default: null },
      mediaId: { default: null },
      uploading: { default: false },
      spaceId: { default: null },
      width: { default: "100%" },
      align: { default: "center" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="encrypted-image"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "encrypted-image",
      }),
    ];
  },

  addCommands() {
    return {
      setEncryptedImage:
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
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
