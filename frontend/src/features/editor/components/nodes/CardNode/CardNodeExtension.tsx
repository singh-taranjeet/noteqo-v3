import React from "react";
import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CardNodeView } from "./CardNodeView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CardNodeExtension = TiptapNode.create({
  name: "shadcnCard",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      colorTheme: {
        default: "default",
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='shadcn-card']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "shadcn-card" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(
      withBlockWrapper(CardNodeView, {
        getCustomUI: (props) => {
          const colorTheme =
            (props.node.attrs.colorTheme as string) || "default";
          return (
            <Select
              value={colorTheme}
              onValueChange={(v) =>
                v && props.updateAttributes({ colorTheme: v })
              }
            >
              <SelectTrigger className="h-6 w-24 text-xs bg-background shadow-sm border focus:ring-0">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="muted">Muted</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      }),
    );
  },
});
