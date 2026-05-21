import React, { useState } from "react";
import { withBlockWrapper } from "@/features/editor/components/editor-ui/withBlockWrapper";
import { ReactNodeViewRenderer } from "@tiptap/react";
import BaseCodeBlock from "@tiptap/extension-code-block";
import { CodeBlockNodeView } from "./CodeBlockNodeView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const CodeBlockCustomUI = (props: NodeViewProps) => {
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
    <>
      <Select
        value={language}
        onValueChange={(value) => props.updateAttributes({ language: value })}
        disabled={!props.editor.isEditable}
      >
        <SelectTrigger className="h-6 w-24 text-xs bg-background shadow-sm border focus:ring-0">
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
        className="h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
        title={isCopied ? "Copied!" : "Copy code"}
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </>
  );
};

export const CodeBlockNode = BaseCodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(
      withBlockWrapper(CodeBlockNodeView, {
        getCustomUI: (props) => <CodeBlockCustomUI {...props} />,
      }),
    );
  },
});
