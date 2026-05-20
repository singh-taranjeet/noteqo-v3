import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { ReactNodeViewRenderer } from "@tiptap/react";
import BaseCodeBlock from "@tiptap/extension-code-block";
import { CodeBlockNodeView } from "./CodeBlockNodeView";

export const CodeBlockNode = BaseCodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(withBlockWrapper(CodeBlockNodeView));
  },
});
