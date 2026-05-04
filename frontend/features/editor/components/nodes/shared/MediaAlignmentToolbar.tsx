"use client";
import { AlignCenter, AlignLeft, AlignRight, Maximize2 } from "lucide-react";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";

type MediaAlignment = "left" | "center" | "right" | "full";

interface MediaAlignmentToolbarProps {
  align: string;
  onAlignChange: (align: MediaAlignment) => void;
}

/**
 * Shared floating alignment toolbar for media nodes (image, video).
 * Renders a ToggleGroup with Left/Center/Right/Full-width options.
 */
export function MediaAlignmentToolbar({
  align,
  onAlignChange,
}: Readonly<MediaAlignmentToolbarProps>) {
  return (
    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-sm p-1 z-20">
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
    </div>
  );
}
