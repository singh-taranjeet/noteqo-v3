import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AudioNodeView } from "./AudioNodeView";

export interface AudioNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: {
        url: string;
        fileName?: string;
        mimeType?: string;
        uploading?: boolean;
        spaceId?: string;
      }) => ReturnType;
    };
  }
}

export const AudioNodeExtension = Node.create<AudioNodeOptions>({
  name: "audio",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "audio-node",
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
    return [{ tag: 'div[data-type="audio"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "audio",
      }),
    ];
  },

  addCommands() {
    return {
      setAudio:
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
    return ReactNodeViewRenderer(withBlockWrapper(AudioNodeView));
  },
});
