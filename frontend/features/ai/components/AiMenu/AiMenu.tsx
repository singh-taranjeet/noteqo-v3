"use client";

import { useEffect, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { useAiActions } from "@/features/ai/hooks/useAiActions";
import { AiMenuContent } from "./AiMenuContent";
import type { AiActionType } from "@/features/ai/types/ai.types";

interface AiMenuProps {
  editor: Editor;
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

export function AiMenu({ editor }: Readonly<AiMenuProps>) {
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

  const handleActionClick = useCallback(
    (actionType: AiActionType) => {
      void executeAction(actionType);
    },
    [executeAction],
  );

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }) => {
        const { selection: sel } = state;
        if (sel.empty) return false;
        const text = state.doc.textBetween(sel.from, sel.to, " ");
        return text.trim().length > 0;
      }}
      className="z-50"
    >
      <TooltipProvider delayDuration={300}>
        <div className="w-52 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-2.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">✨</span>
              <span className="text-xs font-semibold text-foreground">
                AI Assistant
              </span>
            </div>
            <Badge
              variant="outline"
              className="h-4 px-1 text-[9px] font-normal text-muted-foreground"
            >
              Local
            </Badge>
          </div>

          {/* Body */}
          <div className="p-1.5">
            <AiMenuContent
              isLoading={isLoading}
              downloadProgress={downloadProgress}
              downloadProgressLabel={downloadProgressLabel}
              streamingPreview={streamingPreview}
              error={error}
              onActionClick={handleActionClick}
              onAbort={abort}
            />
          </div>
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
}
