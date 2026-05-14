import { ReactNodeViewRenderer } from "@tiptap/react";
import BaseHorizontalRule from "@tiptap/extension-horizontal-rule";
import { HorizontalRuleNodeView } from "./index";

export const HorizontalRule = BaseHorizontalRule.extend({
  addAttributes() {
    return {
      variant: {
        default: "solid",
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(HorizontalRuleNodeView);
  },
});
