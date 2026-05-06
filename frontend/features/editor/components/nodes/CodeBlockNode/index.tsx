import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const text = props.node.textContent;
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
          title={isCopied ? "Copied!" : "Copy code"}
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm font-mono text-foreground">
        <code>
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};
