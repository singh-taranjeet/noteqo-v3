import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import { Checkbox } from "@/components/ui/checkbox"
import React from "react"
import type { NodeViewProps } from "@tiptap/react"

export const TaskItemNodeView: React.FC<NodeViewProps> = (props) => {
  return (
    <NodeViewWrapper className="flex items-start gap-2 my-2">
      <div className="mt-1" contentEditable={false}>
        <Checkbox
          checked={props.node.attrs.checked}
          onCheckedChange={(checked) => props.updateAttributes({ checked })}
        />
      </div>
      <NodeViewContent className="flex-1 min-w-0" />
    </NodeViewWrapper>
  )
}
