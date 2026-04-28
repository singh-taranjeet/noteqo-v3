"use client";

import React from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipIconButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "children"
> {
  icon: IconSvgElement;
  tooltip: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  iconSize?: number;
}

/**
 * A ghost icon button with a tooltip — the most common interactive pattern
 * in headers, toolbars, and sidebars.
 */
export function TooltipIconButton({
  icon,
  tooltip,
  tooltipSide = "bottom",
  iconSize = 16,
  ...buttonProps
}: Readonly<TooltipIconButtonProps>) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={tooltip}
          {...buttonProps}
        >
          <HugeiconsIcon icon={icon} size={iconSize} strokeWidth={1.5} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
