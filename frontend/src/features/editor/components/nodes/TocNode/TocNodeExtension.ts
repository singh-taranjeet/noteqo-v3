import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TocNodeView } from "./TocNodeView";

export interface TocNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toc: {
      setToc: () => ReturnType;
    };
  }
}

export const TocNodeExtension = Node.create<TocNodeOptions>({
  name: "toc",
  group: "block",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "toc-node",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="toc"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "toc",
      }),
    ];
  },

  addCommands() {
    return {
      setToc:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(withBlockWrapper(TocNodeView));
  },
});
