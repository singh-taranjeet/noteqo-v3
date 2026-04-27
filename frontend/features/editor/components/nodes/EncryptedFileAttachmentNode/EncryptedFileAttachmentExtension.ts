import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EncryptedFileAttachmentNode as EncryptedFileAttachmentNodeComponent } from "./EncryptedFileAttachmentNode";

export interface EncryptedFileAttachmentOptions {
  HTMLAttributes: Record<string, any>;
  spaceId: string | null;
}

export const EncryptedFileAttachmentExtension = Node.create<EncryptedFileAttachmentOptions>({
  name: "fileAttachment",

  group: "block",

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      spaceId: null,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      filename: {
        default: null,
      },
      sizeBytes: {
        default: null,
      },
      mimeType: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "file-attachment" }, this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EncryptedFileAttachmentNodeComponent);
  },
});
