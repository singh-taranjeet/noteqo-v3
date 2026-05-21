import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import type { NodeViewProps } from "@tiptap/react";

export const CodeBlockNodeView: React.FC<NodeViewProps> = () => {
  return (
    <NodeViewWrapper className="relative my-6 rounded-md border bg-muted overflow-hidden">
      <pre className="overflow-x-auto p-4 text-sm font-mono text-foreground">
        <code>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
