import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import type { NodeViewProps } from "@tiptap/react";

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
];

export const CodeBlockNodeView: React.FC<NodeViewProps> = (props) => {
  const language = props.node.attrs.language || "plaintext";

  return (
    <NodeViewWrapper className="relative my-6 rounded-md border bg-muted">
      <div
        contentEditable={false}
        className="flex items-center justify-between border-b bg-background/50 px-4 py-2"
      >
        <Select
          defaultValue={language}
          onValueChange={(value) => props.updateAttributes({ language: value })}
          disabled={!props.editor.isEditable}
        >
          <SelectTrigger className="h-7 w-36 border-none bg-transparent text-xs focus:ring-0">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono text-foreground">
        <code>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
