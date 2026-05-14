import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ToggleNodeView } from "./ToggleNodeView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toggle: {
      setToggle: () => ReturnType;
    };
  }
}

export const ToggleNodeExtension = Node.create({
  name: "toggle",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      isOpen: {
        default: true,
      },
      title: {
        default: "",
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='toggle']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "toggle" }),
      0,
    ];
  },

  addCommands() {
    return {
      setToggle:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: "paragraph" }],
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleNodeView);
  },
});
