import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Maximize2,
  Trash2,
} from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type MediaAlignment = "left" | "center" | "right" | "full";

interface MediaAlignmentToolbarProps {
  align: string;
  onAlignChange: (align: MediaAlignment) => void;
  onDelete?: () => void;
}

/**
 * Shared floating alignment toolbar for media nodes (image, video).
 * Renders a ToggleGroup with Left/Center/Right/Full-width options.
 */
export function MediaAlignmentToolbar({
  align,
  onAlignChange,
  onDelete,
}: Readonly<MediaAlignmentToolbarProps>) {
  return (
    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-sm p-1 z-20 flex items-center gap-1">
      <ToggleGroup
        type="single"
        value={align || "center"}
        onValueChange={(value) => {
          if (value) onAlignChange(value as MediaAlignment);
        }}
        className="gap-1"
      >
        <ToggleGroupItem
          value="left"
          aria-label="Align Left"
          className="h-7 w-7 p-0"
        >
          <AlignLeft size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="center"
          aria-label="Align Center"
          className="h-7 w-7 p-0"
        >
          <AlignCenter size={16} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="right"
          aria-label="Align Right"
          className="h-7 w-7 p-0"
        >
          <AlignRight size={16} />
        </ToggleGroupItem>
        <Separator orientation="vertical" className="h-4 mx-0.5" />
        <ToggleGroupItem
          value="full"
          aria-label="Full Width"
          className="h-7 w-7 p-0"
        >
          <Maximize2 size={16} />
        </ToggleGroupItem>
      </ToggleGroup>

      {onDelete && (
        <>
          <Separator orientation="vertical" className="h-4 mx-0.5" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
            title="Remove from note"
          >
            <Trash2 size={16} />
          </Button>
        </>
      )}
    </div>
  );
}
