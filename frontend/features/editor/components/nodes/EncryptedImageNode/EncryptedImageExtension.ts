import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EncryptedImageNode as EncryptedImageNodeComponent } from "./EncryptedImageNode";

export interface EncryptedImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, unknown>;
  spaceId: string | null;
}

export const EncryptedImageExtension = Node.create<EncryptedImageOptions>({
  name: "image", // Overrides the default 'image' extension

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      spaceId: null,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EncryptedImageNodeComponent);
  },
});
