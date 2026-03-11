import { ReactNodeViewRenderer } from "@tiptap/react"
import BaseCodeBlock from "@tiptap/extension-code-block"
import { CodeBlockNodeView } from "./index"

export const CodeBlockNode = BaseCodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView)
  },
})
