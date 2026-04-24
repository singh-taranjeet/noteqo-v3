import { Extension } from "@tiptap/core";

/**
 * AiExtension
 *
 * A lightweight Tiptap extension that emits a custom DOM event on every
 * selection change. The AiMenu component listens to this event to
 * open/close and reposition itself based on the current selection.
 *
 * Using a custom event (instead of React props) avoids prop-drilling
 * through the editor component tree and keeps the extension framework-agnostic.
 */

export const AI_SELECTION_EVENT = "ai:selection-change" as const;

export interface AiSelectionEventDetail {
  selectedText: string;
  selectionFrom: number;
  selectionTo: number;
  isEmpty: boolean;
}

export const AiExtension = Extension.create({
  name: "aiAssistant",

  onSelectionUpdate() {
    const { state } = this.editor;
    const { selection } = state;
    const { from, to, empty } = selection;

    const selectedText = empty ? "" : state.doc.textBetween(from, to, " ");

    const detail: AiSelectionEventDetail = {
      selectedText,
      selectionFrom: from,
      selectionTo: to,
      isEmpty: empty,
    };

    const event = new CustomEvent<AiSelectionEventDetail>(AI_SELECTION_EVENT, {
      detail,
      bubbles: true,
    });

    this.editor.view.dom.dispatchEvent(event);
  },
});
