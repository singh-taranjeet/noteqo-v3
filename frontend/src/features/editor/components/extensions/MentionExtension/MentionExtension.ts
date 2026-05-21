import { Mention as BaseMention } from "@tiptap/extension-mention";
import type { MentionOptions } from "@tiptap/extension-mention";
import { ReactRenderer } from "@tiptap/react";
import type { Editor, Range } from "@tiptap/core";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import tippy, { type Instance, type GetReferenceClientRect } from "tippy.js";
import { MentionList } from "./MentionList";
import { noteService } from "@/features/workspace";

interface MentionListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

export interface CustomMentionOptions extends MentionOptions {
  getSpaceId: () => string | null;
}

export const MentionExtension = BaseMention.extend<CustomMentionOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
      getSpaceId: () => null as string | null,
      suggestion: {
        ...this.parent?.().suggestion,
        char: "@",
        items: async ({ query, editor }: { query: string; editor: Editor }) => {
          const extension = editor.extensionManager.extensions.find(
            (e) => e.name === "mention",
          );
          const spaceId = extension?.options.getSpaceId?.() as string | null;
          if (!spaceId) return [];
          const notes = await noteService.getLocalNotesForSpace(spaceId);
          return notes
            .filter((note) =>
              (note.title || "Untitled")
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .slice(0, 20);
        },
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: Record<string, unknown>;
        }) => {
          // Increase range.to by one when the next node is of type "text"
          // and starts with a space character
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
                type: "mention",
                attrs: props,
              },
              {
                type: "text",
                text: " ",
              },
            ])
            .run();
        },
        render: () => {
          let component: ReactRenderer;
          let popup: Instance[];

          return {
            onStart: (
              props: Record<string, unknown> & {
                editor: Editor;
                clientRect: GetReferenceClientRect;
              },
            ) => {
              component = new ReactRenderer(MentionList, {
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

            onUpdate(
              props: Record<string, unknown> & {
                clientRect: GetReferenceClientRect;
              },
            ) {
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
              return (component.ref as MentionListHandle | null)?.onKeyDown(
                props,
              );
            },

            onExit() {
              popup[0]?.destroy();
              component?.destroy();
            },
          };
        },
      },
    } as unknown as CustomMentionOptions;
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            "data-id": attributes.id,
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }
          return {
            "data-label": attributes.label,
          };
        },
      },
      icon: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-icon"),
        renderHTML: (attributes) => {
          if (!attributes.icon) {
            return {};
          }
          return {
            "data-icon": attributes.icon,
          };
        },
      },
    };
  },

  renderHTML({ node }) {
    const { id, label, icon } = node.attrs;

    return [
      "a",
      {
        href: `/notes/${id}`,
        class:
          "inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-sm  text-foreground no-underline hover:bg-muted/80 cursor-pointer",
        "data-type": "mention",
        "data-id": id,
        "data-label": label,
        "data-icon": icon,
      },
      ["span", { class: "mr-0.5" }, icon || "📄"],
      [
        "span",
        { class: "underline underline-offset-4 decoration-muted-foreground" },
        label || id,
      ],
    ];
  },
});
