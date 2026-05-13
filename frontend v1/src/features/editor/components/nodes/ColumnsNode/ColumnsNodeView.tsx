
import React, { useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ColumnsNodeView = ({
  editor,
  node,
  updateAttributes,
}: NodeViewProps) => {
  const visible = node.attrs.visibleColumns || 2;
  const containerRef = useRef<HTMLDivElement>(null);

  // Imperatively force flex layout on TipTap's generated DOM
  useEffect(() => {
    if (!containerRef.current) return;

    const applyFlexLayout = () => {
      const el = containerRef.current;
      if (!el) return;

      // Find all descendant elements and look for the container
      // that is the direct parent of the column-item NodeViewWrappers
      const columnItems = el.querySelectorAll("[data-column-item='true']");
      if (columnItems.length === 0) return;

      // Walk up from first column item to find the common parent,
      // then force flex on every container between our ref and the items
      let current = columnItems[0].parentElement;
      while (current && current !== el) {
        current.style.display = "flex";
        current.style.flexDirection = "row";
        current.style.gap = "8px";
        current.style.width = "100%";
        current = current.parentElement;
      }

      // Style each column item wrapper
      columnItems.forEach((item, index) => {
        const wrapper = item as HTMLElement;
        // Also set flex on the TipTap [data-node-view-wrapper] parent
        if (wrapper.parentElement && wrapper.parentElement !== el) {
          wrapper.parentElement.style.flex = "1";
          wrapper.parentElement.style.minWidth = "0";
        }
        wrapper.style.flex = "1";
        wrapper.style.minWidth = "0";
        wrapper.style.padding = "0 4px";

        // Hide columns that exceed the visible count
        if (index >= visible) {
          wrapper.style.display = "none";
          if (wrapper.parentElement) {
            wrapper.parentElement.style.display = "none";
          }
        } else {
          wrapper.style.display = "block";
          if (wrapper.parentElement) {
            wrapper.parentElement.style.display = "block";
          }
        }
      });
    };

    // Apply immediately and also observe for DOM changes
    applyFlexLayout();
    const observer = new MutationObserver(applyFlexLayout);
    observer.observe(containerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [visible]);

  return (
    <NodeViewWrapper className="w-full my-2 not-prose block">
      <div className="relative group">
        {/* Column selector (edit mode, shown on hover) */}
        {editor.isEditable && (
          <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <Select
              value={String(visible)}
              onValueChange={(v) =>
                v && updateAttributes({ visibleColumns: parseInt(v) })
              }
            >
              <SelectTrigger className="h-6 w-20 text-xs bg-background shadow-sm border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 columns</SelectItem>
                <SelectItem value="3">3 columns</SelectItem>
                <SelectItem value="4">4 columns</SelectItem>
                <SelectItem value="5">5 columns</SelectItem>
                <SelectItem value="6">6 columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Columns container */}
        <div ref={containerRef}>
          <NodeViewContent />
        </div>
      </div>

      {/* Show dashed borders on column items when hovering the columns block */}
      <style>{`
        .group:hover .column-item-hover [data-node-view-content] {
          border-color: hsl(var(--border)) !important;
          border-style: dashed !important;
        }
      `}</style>
    </NodeViewWrapper>
  );
};
