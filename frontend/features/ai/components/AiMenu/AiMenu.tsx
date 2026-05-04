"use client";
import { Sparkles } from "lucide-react";

import { useEffect, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAiActions } from "@/features/ai/hooks/useAiActions";
import { AiMenuContent } from "./AiMenuContent";
import type { AiActionType } from "@/features/ai/types/ai.types";

interface AiMenuProps {
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

export function AiMenu({
  editor,
  isOpen,
  onOpenChange,
}: Readonly<AiMenuProps>) {
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
    <Popover modal={false} open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-purple-500 hover:text-purple-600 hover:bg-purple-500/10 rounded-sm gap-1 transition-colors"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Sparkles className="text-purple-500" size={14} />
          <span className="text-xs font-medium">Ask AI</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-52 p-0 overflow-hidden shadow-lg z-50 bg-popover rounded-md"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-muted/30 px-2.5 py-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="text-purple-500" size={14} />
              <span className="text-xs font-semibold text-foreground">
                AI Assistant
              </span>
            </div>
            <Badge
              variant="outline"
              className="h-4 px-1 text-xs font-normal text-muted-foreground"
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
      </PopoverContent>
    </Popover>
  );
}
