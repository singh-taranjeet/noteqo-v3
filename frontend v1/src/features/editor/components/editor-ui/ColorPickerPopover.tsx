import { ChevronDown, Type } from "lucide-react";

import React from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TEXT_COLORS,
  HIGHLIGHT_COLORS,
} from "@/features/editor/constants/colors";

interface ColorPickerPopoverProps {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  editor,
  isOpen,
  onOpenChange,
}) => {
  // Compute active colors from editor attributes
  const currentColor = editor.getAttributes("textStyle").color || "";
  const currentHighlight = editor.getAttributes("highlight").color || "";

  const setTextColor = (color: string) => {
    if (!color) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setHighlightColor = (color: string) => {
    if (!color) {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  return (
    <Popover modal={false} open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground hover:bg-muted/50 rounded-sm gap-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Type className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-64 p-3 overflow-y-auto max-h-80 shadow-lg z-50 bg-popover rounded-md"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        onCloseAutoFocus={(e: Event) => e.preventDefault()}
      >
        <div className="mb-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Text Color
          </div>
          <div className="grid grid-cols-5 gap-2">
            {TEXT_COLORS.map((swatch) => (
              <Button
                key={`text-${swatch.name}`}
                variant="outline"
                onClick={() => setTextColor(swatch.color)}
                title={swatch.name}
                className={`w-8 h-8 p-0 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  currentColor === swatch.color
                    ? "ring-2 ring-foreground/40 ring-offset-2"
                    : ""
                }`}
                style={{ color: swatch.color || "inherit" }}
              >
                <span className="font-serif font-medium text-sm">A</span>
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Highlight Color
          </div>
          <div className="grid grid-cols-5 gap-2">
            {HIGHLIGHT_COLORS.map((swatch) => (
              <Button
                key={`bg-${swatch.name}`}
                variant="outline"
                onClick={() => setHighlightColor(swatch.color)}
                title={swatch.name}
                className={`w-8 h-8 p-0 rounded-full transition-transform hover:scale-110 ${
                  currentHighlight === swatch.color
                    ? "ring-2 ring-foreground/40 ring-offset-2"
                    : ""
                }`}
                style={{ backgroundColor: swatch.color || "transparent" }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
