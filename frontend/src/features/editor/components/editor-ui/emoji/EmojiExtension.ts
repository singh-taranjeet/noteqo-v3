import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import type {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
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
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: EmojiItem;
        }) => {
          const item = props;
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
            onStart: (props: SuggestionProps<EmojiItem>) => {
              component = new ReactRenderer(EmojiList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate(props: SuggestionProps<EmojiItem>) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },
            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                popup[0].hide();
                return true;
              }

              return component.ref?.onKeyDown(props) || false;
            },
            onExit() {
              if (popup && popup[0]) popup[0].destroy();
              if (component) component.destroy();
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
