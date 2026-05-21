import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbedNodeView } from "./EmbedNodeView";

export interface EmbedNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { url: string }) => ReturnType;
    };
  }
}

export const EmbedNodeExtension = Node.create<EmbedNodeOptions>({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "embed-node",
      },
    };
  },

  addAttributes() {
    return {
      url: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "embed",
      }),
    ];
  },

  addCommands() {
    return {
      setEmbed:
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
    return ReactNodeViewRenderer(withBlockWrapper(EmbedNodeView));
  },
});
