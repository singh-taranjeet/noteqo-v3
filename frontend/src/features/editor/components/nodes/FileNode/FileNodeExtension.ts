import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FileNodeView } from "./FileNodeView";
import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";

export interface FileNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileAttachment: {
      /**
       * Add a file attachment node
       */
      setFileAttachment: (options: {
        url?: string;
        fileName?: string;
        mimeType?: string;
        sizeBytes?: number;
        mediaId?: string;
        uploading?: boolean;
      }) => ReturnType;
    };
  }
}

export const FileNodeExtension = Node.create<FileNodeOptions>({
  name: "fileAttachment",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "file-attachment",
      },
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
      },
      fileName: {
        default: null,
      },
      mimeType: {
        default: null,
      },
      sizeBytes: {
        default: null,
      },
      mediaId: {
        default: null,
      },
      uploading: {
        default: false,
      },
      spaceId: {
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
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "file-attachment",
      }),
    ];
  },

  addCommands() {
    return {
      setFileAttachment:
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
    return ReactNodeViewRenderer(withBlockWrapper(FileNodeView));
  },
});
