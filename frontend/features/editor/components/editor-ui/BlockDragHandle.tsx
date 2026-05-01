"use client";
import { GripVertical, Plus } from "lucide-react";
import React from "react";
import type { Editor } from "@tiptap/react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const TOOLTIP_CONTENT = {
  ADD_BLOCK: "Click to open menu",
  DRAG_MOVE: "Drag to move",
} as const;

interface BlockDragHandleProps {
  editor: Editor | null;
}

export const BlockDragHandle: React.FC<BlockDragHandleProps> = ({ editor }) => {
  if (!editor || !editor.isEditable) return null;

  const openSlashMenu = (e?: React.MouseEvent) => {
    e?.preventDefault();
    // Trigger slash command menu by inserting a slash, forcing suggestion plugin to open
    editor.chain().focus().insertContent("/").run();
  };

  return (
    <DragHandle editor={editor}>
      <div className="flex items-center gap-1 text-muted-foreground mr-2 pb-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={openSlashMenu}
                className="h-6 w-6 rounded-sm text-muted-foreground"
                aria-label="Add block"
              >
                <Plus size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{TOOLTIP_CONTENT.ADD_BLOCK}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={openSlashMenu}
                className="hover:bg-muted p-1 rounded-sm cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors"
                aria-label="Drag to move block"
              >
                <GripVertical size={16} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-semibold mb-1">{TOOLTIP_CONTENT.DRAG_MOVE}</p>
              <p className="font-semibold">{TOOLTIP_CONTENT.ADD_BLOCK}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </DragHandle>
  );
};
