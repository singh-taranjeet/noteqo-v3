import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "@tiptap/y-tiptap";
import type { Awareness } from "y-protocols/awareness";
import "./CollaborationCursor.css";

export interface CollaborationCursorOptions {
  provider: { awareness: Awareness } | any;
  user: Record<string, any>;
  render: (user: Record<string, any>) => HTMLElement;
}

export const CollaborationCursor = Extension.create<CollaborationCursorOptions>({
  name: "collaborationCursor",

  addOptions() {
    return {
      provider: null,
      user: {
        name: "User",
        color: "#ecc94b",
      },
      render: (user: Record<string, any>) => {
        const cursor = document.createElement("span");

        cursor.classList.add("collaboration-cursor__caret");
        cursor.setAttribute("style", `border-color: ${user.color}`);

        const label = document.createElement("div");

        label.classList.add("collaboration-cursor__label");
        label.setAttribute("style", `background-color: ${user.color}`);
        label.insertBefore(document.createTextNode(user.name), null);

        cursor.insertBefore(label, null);

        return cursor;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      yCursorPlugin(this.options.provider.awareness, {
        cursorBuilder: this.options.render,
      }),
    ];
  },
});
