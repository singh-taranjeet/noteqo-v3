import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const DateNodeView = (props: NodeViewProps) => {
  const { node, updateAttributes, editor, selected } = props;
  const [open, setOpen] = useState(false);
  const dateStr = node.attrs.date;
  const date = dateStr ? new Date(dateStr) : new Date();

  return (
    <NodeViewWrapper className="inline-block align-middle mx-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={!editor.isEditable}>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-sm font-medium transition-colors cursor-pointer select-none",
              "bg-muted hover:bg-muted/80 text-muted-foreground",
              selected
                ? "ring-2 ring-primary/50 bg-primary/10 text-primary"
                : "",
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {format(date, "MMM d, yyyy")}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            captionLayout="dropdown"
            onSelect={(newDate) => {
              if (newDate) {
                updateAttributes({ date: newDate.toISOString() });
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
};
