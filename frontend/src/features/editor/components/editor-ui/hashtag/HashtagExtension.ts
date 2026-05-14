import Mention from "@tiptap/extension-mention";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import type { Instance as TippyInstance } from "tippy.js";
import { HashtagList } from "./HashtagList";
import type { HashtagListRef } from "./HashtagList";
import type {
  SuggestionProps,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { MentionOptions } from "@tiptap/extension-mention";

export const HashtagPluginKey = new PluginKey("hashtag-suggestion");

export const HashtagExtension = Mention.extend({
  name: "hashtag",

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class:
          "text-primary bg-primary/10 rounded-md px-1 py-0.5 font-medium cursor-pointer hover:bg-primary/20 transition-colors",
      },
      renderHTML({
        options,
        node,
      }: {
        options: MentionOptions;
        node: ProseMirrorNode;
      }) {
        return ["span", options.HTMLAttributes, `#${node.attrs.id}`];
      },
      renderText({
        options,
        node,
      }: {
        options: MentionOptions;
        node: ProseMirrorNode;
      }) {
        return `${options.suggestion.char}${node.attrs.id ?? node.attrs.label}`;
      },
      deleteTriggerWithBackspace: false,
      suggestion: {
        char: "#",
        pluginKey: HashtagPluginKey,
        command: ({ editor, range, props }) => {
          // increase range.to by one when the next node is a space
          // This ensures that the hashtag symbol is completely removed
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(" ");

          if (overrideSpace) {
            range.to += 1;
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: this.name,
                attrs: props,
              },
              {
                type: "text",
                text: " ",
              },
            ])
            .run();

          window.getSelection()?.collapseToEnd();
        },
        items: ({ query }: { query: string }) => {
          // Pre-defined set of tags for offline autocomplete
          const defaultTags = [
            "engineering",
            "design",
            "marketing",
            "personal",
            "ideas",
            "todo",
            "important",
            "meeting",
            "research",
            "draft",
            "journal",
            "project",
            "bug",
          ];

          if (!query) return defaultTags.slice(0, 5);

          const exactMatch = defaultTags.find(
            (tag) => tag.toLowerCase() === query.toLowerCase(),
          );

          const filtered = defaultTags.filter((tag) =>
            tag.toLowerCase().startsWith(query.toLowerCase()),
          );

          // If the user types a custom tag that isn't in the default list,
          // we should still allow them to create it!
          if (!exactMatch && query.trim().length > 0) {
            filtered.unshift(query.trim().toLowerCase());
          }

          return filtered.slice(0, 5);
        },
        render: () => {
          let component: ReactRenderer<HashtagListRef>;
          let popup: TippyInstance[];

          return {
            onStart: (props: SuggestionProps<string>) => {
              component = new ReactRenderer(HashtagList, {
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
            onUpdate(props: SuggestionProps<string>) {
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
      },
      suggestions: [],
    };
  },
});
