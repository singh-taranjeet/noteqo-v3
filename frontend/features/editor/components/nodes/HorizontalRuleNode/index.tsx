import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import { Separator } from "@/components/ui/separator"
import React from "react"
import type { NodeViewProps } from "@tiptap/react"

export const HorizontalRuleNodeView: React.FC<NodeViewProps> = () => {
  return (
    <NodeViewWrapper className="my-8">
      <Separator />
    </NodeViewWrapper>
  )
}
