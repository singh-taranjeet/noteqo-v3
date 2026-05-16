import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import type { SuggestionOptions } from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { searchEmojis } from "./emojiUtils";
import type { EmojiItem } from "./emojiUtils";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import type { Instance as TippyInstance } from "tippy.js";
import { EmojiList } from "./EmojiList";
import type { EmojiListRef } from "./EmojiList";

export const EmojiPluginKey = new PluginKey("emoji-suggestion");

export const EmojiExtension = Extension.create({
  name: "emojiSuggestion",

  addOptions() {
    return {
      suggestion: {
        char: ":",
        pluginKey: EmojiPluginKey,
        command: ({ editor, range, props }: any) => {
          const item = props as EmojiItem;
          // Increase range.to by one when the next node is a space
          // This ensures that the colon is completely removed
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(" ");

          if (overrideSpace) {
            range.to += 1;
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, item.emoji + " ")
            .run();
        },
        items: ({ query }: { query: string }) => {
          return searchEmojis(query);
        },
        render: () => {
          let component: ReactRenderer<EmojiListRef>;
          let popup: TippyInstance[];

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(EmojiList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate(props: any) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },
            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                popup[0].hide();
                return true;
              }

              return component.ref?.onKeyDown(props) || false;
            },
            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      } as Omit<SuggestionOptions, "editor">,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
