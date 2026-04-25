"use client";

import { useEffect, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { EditorPopover } from "@/features/editor/components/editor-ui/EditorPopover";
import { useAiActions } from "@/features/ai/hooks/useAiActions";
import { AiMenuContent } from "./AiMenuContent";

interface AiMenuPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectionState {
  selectedText: string;
  selectionFrom: number;
  selectionTo: number;
}

const EMPTY_SELECTION: SelectionState = {
  selectedText: "",
  selectionFrom: 0,
  selectionTo: 0,
};

export function AiMenuPopover({
  editor,
  isOpen,
  onOpenChange,
}: Readonly<AiMenuPopoverProps>) {
  const [selection, setSelection] = useState<SelectionState>(EMPTY_SELECTION);

  const {
    isLoading,
    streamingPreview,
    error,
    downloadProgress,
    downloadProgressLabel,
    executeAction,
    abort,
  } = useAiActions({
    editor,
    selectedText: selection.selectedText,
    selectionFrom: selection.selectionFrom,
    selectionTo: selection.selectionTo,
  });

  const handleSelectionUpdate = useCallback(
    ({ editor: e }: { editor: Editor }) => {
      const { selection: sel } = e.state;
      if (sel.empty) {
        setSelection(EMPTY_SELECTION);
        return;
      }
      const text = e.state.doc.textBetween(sel.from, sel.to, " ");
      setSelection({
        selectedText: text,
        selectionFrom: sel.from,
        selectionTo: sel.to,
      });
    },
    [],
  );

  useEffect(() => {
    editor.on("selectionUpdate", handleSelectionUpdate);
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, handleSelectionUpdate]);

  return (
    <EditorPopover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      align="start"
      contentClassName="w-52 p-1.5 shadow-lg z-50 bg-popover"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground hover:bg-muted/50 rounded-sm gap-1 hover:text-foreground transition-colors"
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="text-sm">✨</span>
          <span className="text-xs font-semibold">AI</span>
        </Button>
      }
    >
      <AiMenuContent
        isLoading={isLoading}
        downloadProgress={downloadProgress}
        downloadProgressLabel={downloadProgressLabel}
        streamingPreview={streamingPreview}
        error={error}
        onActionClick={(actionType) => void executeAction(actionType)}
        onAbort={abort}
      />
    </EditorPopover>
  );
}
