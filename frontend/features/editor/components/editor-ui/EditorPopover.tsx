import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorPopoverProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  tooltipText?: string;
}

export const EditorPopover: React.FC<EditorPopoverProps> = ({
  isOpen,
  onOpenChange,
  trigger,
  children,
  contentClassName = "w-auto p-1",
  align = "start",
  sideOffset = 8,
  tooltipText,
}) => {
  const popoverContent = (
    <PopoverContent
      align={align}
      sideOffset={sideOffset}
      className={`shadow-md bg-popover rounded-md ${contentClassName}`}
      onOpenAutoFocus={(e: Event) => e.preventDefault()}
      onCloseAutoFocus={(e: Event) => e.preventDefault()}
    >
      {children}
    </PopoverContent>
  );

  const triggerContent = <PopoverTrigger asChild>{trigger}</PopoverTrigger>;

  if (tooltipText) {
    return (
      <Popover modal={false} open={isOpen} onOpenChange={onOpenChange}>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{triggerContent}</TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {popoverContent}
      </Popover>
    );
  }

  return (
    <Popover modal={false} open={isOpen} onOpenChange={onOpenChange}>
      {triggerContent}
      {popoverContent}
    </Popover>
  );
};
