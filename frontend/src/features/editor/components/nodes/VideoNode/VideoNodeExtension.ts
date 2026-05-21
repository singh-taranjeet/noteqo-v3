import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { VideoNodeView } from "./VideoNodeView";

export interface VideoNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    encryptedVideo: {
      setEncryptedVideo: (options: {
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

export const VideoNodeExtension = Node.create<VideoNodeOptions>({
  name: "encryptedVideo",

  group: "block",

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "encrypted-video-node",
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
        tag: 'div[data-type="encrypted-video"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "encrypted-video",
      }),
    ];
  },

  addCommands() {
    return {
      setEncryptedVideo:
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
    return ReactNodeViewRenderer(withBlockWrapper(VideoNodeView));
  },
});
