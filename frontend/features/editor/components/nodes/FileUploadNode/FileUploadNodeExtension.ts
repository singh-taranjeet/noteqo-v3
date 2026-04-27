import { mergeAttributes, Node } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FileUploadNode as FileUploadNodeComponent } from "@/features/editor/components/nodes/FileUploadNode/FileUploadNode";
import type { NodeType } from "@tiptap/pm/model";

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal,
) => Promise<string>;

export interface FileUploadNodeOptions {
  type?: string | NodeType | undefined;
  accept?: string;
  limit?: number;
  maxSize?: number;
  upload?: UploadFunction;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    fileUpload: {
      setFileUploadNode: (options?: FileUploadNodeOptions) => ReturnType;
    };
  }
}

export const FileUploadNode = Node.create<FileUploadNodeOptions>({
  name: "fileUpload",

  group: "block",

  draggable: true,

  selectable: true,

  atom: true,

  addOptions() {
    return {
      type: "fileAttachment",
      accept: "*/*",
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      accept: { default: this.options.accept },
      limit: { default: this.options.limit },
      maxSize: { default: this.options.maxSize },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="file-upload"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "file-upload" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileUploadNodeComponent);
  },

  addCommands() {
    return {
      setFileUploadNode:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { nodeAfter } = selection.$from;

        if (
          nodeAfter &&
          nodeAfter.type.name === "fileUpload" &&
          editor.isActive("fileUpload")
        ) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos);
          if (nodeEl && nodeEl instanceof HTMLElement) {
            const firstChild = nodeEl.firstChild;
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click();
              return true;
            }
          }
        }
        return false;
      },
    };
  },
});
