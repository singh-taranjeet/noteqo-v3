import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DateNodeView } from "./DateNodeView";

export interface DateNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    date: {
      setDate: (options?: { date?: string }) => ReturnType;
    };
  }
}

export const DateNodeExtension = Node.create<DateNodeOptions>({
  name: "date",
  group: "inline",
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: "date-node",
      },
    };
  },

  addAttributes() {
    return {
      date: {
        default: new Date().toISOString(),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="date"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "date",
      }),
    ];
  },

  addCommands() {
    return {
      setDate:
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
    return ReactNodeViewRenderer(withBlockWrapper(DateNodeView));
  },
});
