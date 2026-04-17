import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance, type GetReferenceClientRect } from "tippy.js";
import { CommandList } from "./CommandList";

import { SLASH_COMMANDS } from "@/features/editor/constants/slashCommands";
import type { SuggestionItem } from "@/features/editor/constants/slashCommands";

/** Shape exposed by CommandList via useImperativeHandle. */
interface CommandListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export const getSuggestionItems = ({
  query,
}: {
  query: string;
}): SuggestionItem[] => {
  return SLASH_COMMANDS.filter((item) =>
    item.title.toLowerCase().startsWith(query.toLowerCase()),
  ).slice(0, 20);
};

export const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SuggestionItem;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: getSuggestionItems,
        render: () => {
          let component: ReactRenderer;
          let popup: Instance[];

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props: {
                  ...props,
                  closeMenu: () => popup[0]?.hide(),
                },
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect:
                  props.clientRect as GetReferenceClientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(props) {
              component.updateProps({
                ...props,
                closeMenu: () => popup[0]?.hide(),
              });
              if (!props.clientRect) return;
              popup[0].setProps({
                getReferenceClientRect:
                  props.clientRect as GetReferenceClientRect,
              });
            },

            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                popup[0].hide();
                return true;
              }
              return (component.ref as CommandListHandle | null)?.onKeyDown(
                props,
              );
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
