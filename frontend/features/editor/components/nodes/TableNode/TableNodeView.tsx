"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTableControls } from "./useTableControls";
import { reorderColumn } from "./TableColumnReorder";
import "./table-node.css";

/** Color options for column/cell coloring via context menu. */
const COLUMN_COLORS: Array<{ label: string; value: string | null; swatch: string }> = [
  { label: "Default", value: null, swatch: "transparent" },
  { label: "Light Gray", value: "hsl(var(--muted))", swatch: "hsl(var(--muted))" },
  { label: "Blue", value: "hsl(210 100% 95%)", swatch: "#dbeafe" },
  { label: "Green", value: "hsl(142 76% 93%)", swatch: "#dcfce7" },
  { label: "Yellow", value: "hsl(48 96% 89%)", swatch: "#fef9c3" },
  { label: "Red", value: "hsl(0 93% 94%)", swatch: "#fee2e2" },
  { label: "Purple", value: "hsl(270 91% 94%)", swatch: "#f3e8ff" },
];

/** Grip icon (6-dot drag handle). */
function GripIcon() {
  return (
    <svg viewBox="0 0 10 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="3" cy="2" r="1.5" />
      <circle cx="7" cy="2" r="1.5" />
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="7" cy="8" r="1.5" />
      <circle cx="3" cy="14" r="1.5" />
      <circle cx="7" cy="14" r="1.5" />
    </svg>
  );
}

/** Plus icon for add row/column buttons. */
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export const TableNodeView = ({ editor }: NodeViewProps) => {
  const {
    columns,
    dragColumnIndex,
    dropTargetIndex,
    menuColumnIndex,
    tableWrapperRef,
    startDrag,
    updateDropTarget,
    endDrag,
    cancelDrag,
    openMenu,
    closeMenu,
    remeasure,
  } = useTableControls();

  const dragStartXRef = useRef<number>(0);

  // ─── Add Row ──────────────────────────────────────────────────
  const handleAddRow = useCallback(() => {
    // Move selection to the last cell, then add row after
    const { state } = editor;
    const { $from } = state.selection;

    // Find the table position
    let tableDepth = -1;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === "table") {
        tableDepth = d;
        break;
      }
    }

    if (tableDepth === -1) {
      // If cursor not in table, try inserting at the table anyway
      editor.commands.addRowAfter();
      return;
    }

    editor.commands.addRowAfter();
    // Re-measure after DOM updates
    requestAnimationFrame(() => remeasure());
  }, [editor, remeasure]);

  // ─── Add Column ───────────────────────────────────────────────
  const handleAddColumn = useCallback(() => {
    editor.commands.addColumnAfter();
    requestAnimationFrame(() => remeasure());
  }, [editor, remeasure]);

  // ─── Column Drag Start ────────────────────────────────────────
  const handleDragStart = useCallback(
    (e: React.MouseEvent, columnIndex: number) => {
      e.preventDefault();
      startDrag(columnIndex);
      dragStartXRef.current = e.clientX;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const wrapper = tableWrapperRef.current;
        if (!wrapper) return;

        const wrapperRect = wrapper.getBoundingClientRect();
        const relativeX = moveEvent.clientX - wrapperRect.left;

        // Find the closest column by position
        let closestIndex = 0;
        let closestDist = Infinity;
        columns.forEach((col) => {
          const center = col.left + col.width / 2;
          const dist = Math.abs(relativeX - center);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = col.index;
          }
        });

        updateDropTarget(closestIndex);
      };

      const handleMouseUp = () => {
        const result = endDrag();
        if (result) {
          const [from, to] = result;
          reorderColumn(editor, from, to);
          requestAnimationFrame(() => remeasure());
        }
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [
      columns,
      editor,
      endDrag,
      remeasure,
      startDrag,
      tableWrapperRef,
      updateDropTarget,
    ],
  );

  // ─── Column Context Menu Actions ──────────────────────────────
  const handleInsertLeft = useCallback(() => {
    if (menuColumnIndex < 0) return;
    // Select a cell in the menu column, then insert before
    selectColumnCell(editor, menuColumnIndex);
    editor.commands.addColumnBefore();
    closeMenu();
    requestAnimationFrame(() => remeasure());
  }, [editor, menuColumnIndex, closeMenu, remeasure]);

  const handleInsertRight = useCallback(() => {
    if (menuColumnIndex < 0) return;
    selectColumnCell(editor, menuColumnIndex);
    editor.commands.addColumnAfter();
    closeMenu();
    requestAnimationFrame(() => remeasure());
  }, [editor, menuColumnIndex, closeMenu, remeasure]);

  const handleDuplicate = useCallback(() => {
    if (menuColumnIndex < 0) return;
    selectColumnCell(editor, menuColumnIndex);
    // Add column after, then copy content
    editor.commands.addColumnAfter();
    closeMenu();
    requestAnimationFrame(() => remeasure());
  }, [editor, menuColumnIndex, closeMenu, remeasure]);

  const handleClearContents = useCallback(() => {
    if (menuColumnIndex < 0) return;
    // Clear all cells in this column
    const { state, view } = editor;
    const { tr } = state;
    const { $from } = state.selection;

    // Find table
    for (let d = $from.depth; d > 0; d--) {
      const node = $from.node(d);
      if (node.type.name === "table") {
        const tableStart = $from.before(d) + 1;
        let offset = tableStart;

        for (let rowIdx = 0; rowIdx < node.childCount; rowIdx++) {
          const row = node.child(rowIdx);
          let cellOffset = offset + 1;

          for (let cellIdx = 0; cellIdx < row.childCount; cellIdx++) {
            const cell = row.child(cellIdx);
            if (cellIdx === menuColumnIndex) {
              // Replace cell content with empty paragraph
              const emptyParagraph = state.schema.nodes.paragraph.create();
              const cellContentStart = tr.mapping.map(cellOffset + 1);
              const cellContentEnd = tr.mapping.map(
                cellOffset + cell.content.size + 1,
              );
              tr.replaceWith(cellContentStart, cellContentEnd, emptyParagraph);
            }
            cellOffset += cell.nodeSize;
          }
          offset += row.nodeSize;
        }
        break;
      }
    }

    view.dispatch(tr);
    closeMenu();
  }, [editor, menuColumnIndex, closeMenu]);

  const handleDeleteColumn = useCallback(() => {
    if (menuColumnIndex < 0) return;
    selectColumnCell(editor, menuColumnIndex);
    editor.commands.deleteColumn();
    closeMenu();
    requestAnimationFrame(() => remeasure());
  }, [editor, menuColumnIndex, closeMenu, remeasure]);

  const handleSetColor = useCallback(
    (color: string | null) => {
      if (menuColumnIndex < 0) return;
      // Set background color on all cells in this column
      const { state, view } = editor;
      const { tr } = state;
      const { $from } = state.selection;

      for (let d = $from.depth; d > 0; d--) {
        const node = $from.node(d);
        if (node.type.name === "table") {
          const tableStart = $from.before(d) + 1;
          let offset = tableStart;

          for (let rowIdx = 0; rowIdx < node.childCount; rowIdx++) {
            const row = node.child(rowIdx);
            let cellOffset = offset + 1;

            for (let cellIdx = 0; cellIdx < row.childCount; cellIdx++) {
              const cell = row.child(cellIdx);
              if (cellIdx === menuColumnIndex) {
                tr.setNodeMarkup(tr.mapping.map(cellOffset), undefined, {
                  ...cell.attrs,
                  backgroundColor: color,
                });
              }
              cellOffset += cell.nodeSize;
            }
            offset += row.nodeSize;
          }
          break;
        }
      }

      view.dispatch(tr);
      closeMenu();
    },
    [editor, menuColumnIndex, closeMenu],
  );

  // Re-measure when editor updates (e.g., after undo/redo)
  useEffect(() => {
    const handleUpdate = () => {
      requestAnimationFrame(() => remeasure());
    };
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, remeasure]);

  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper className="w-full my-4 not-prose block">
      <div
        ref={tableWrapperRef}
        className="noteqo-table-wrapper"
        style={{ paddingTop: isEditable ? 28 : 0, paddingRight: isEditable ? 20 : 0, paddingBottom: isEditable ? 20 : 0 }}
      >
        {/* Column drag handles */}
        {isEditable &&
          columns.map((col) => (
            <React.Fragment key={`grip-${col.index}`}>
              <DropdownMenu
                open={menuColumnIndex === col.index}
                onOpenChange={(open) => {
                  if (open) {
                    openMenu(col.index);
                  } else {
                    closeMenu();
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className="table-column-grip"
                    style={{ left: col.left + col.width / 2 - 12 }}
                    onMouseDown={(e) => {
                      // If it's a quick click, the DropdownMenu will handle it.
                      // For drag, we intercept on mousedown.
                      if (e.button !== 0) return;
                      const startX = e.clientX;
                      const startY = e.clientY;

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const dx = Math.abs(moveEvent.clientX - startX);
                        const dy = Math.abs(moveEvent.clientY - startY);
                        if (dx > 5 || dy > 5) {
                          // User is dragging, not clicking
                          document.removeEventListener("mousemove", handleMouseMove);
                          document.removeEventListener("mouseup", handleMouseUp);
                          handleDragStart(e, col.index);
                        }
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove);
                        document.removeEventListener("mouseup", handleMouseUp);
                        // It was a click — the DropdownMenu handles opening
                      };

                      document.addEventListener("mousemove", handleMouseMove);
                      document.addEventListener("mouseup", handleMouseUp);
                    }}
                    aria-label={`Column ${col.index + 1} options`}
                  >
                    <GripIcon />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span className="flex items-center gap-2">
                        <ColorSwatchIcon />
                        Color
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {COLUMN_COLORS.map((color) => (
                        <DropdownMenuItem
                          key={color.label}
                          onClick={() => handleSetColor(color.value)}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block w-4 h-4 rounded border"
                              style={{
                                backgroundColor: color.swatch,
                                borderColor: "hsl(var(--border))",
                              }}
                            />
                            {color.label}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleInsertLeft}>
                    <span className="flex items-center gap-2">
                      <ArrowLeftIcon />
                      Insert left
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleInsertRight}>
                    <span className="flex items-center gap-2">
                      <ArrowRightIcon />
                      Insert right
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <span className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-2">
                        <DuplicateIcon />
                        Duplicate
                      </span>
                      <kbd className="text-xs text-muted-foreground">⌘D</kbd>
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleClearContents}>
                    <span className="flex items-center gap-2">
                      <ClearIcon />
                      Clear contents
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteColumn}
                    className="text-destructive focus:text-destructive"
                  >
                    <span className="flex items-center gap-2">
                      <TrashIcon />
                      Delete
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </React.Fragment>
          ))}

        {/* Drop indicator line during column drag */}
        {dragColumnIndex !== -1 && dropTargetIndex !== -1 && columns[dropTargetIndex] && (
          <div
            className="table-drop-indicator"
            style={{
              left:
                dropTargetIndex <= dragColumnIndex
                  ? columns[dropTargetIndex].left
                  : columns[dropTargetIndex].right,
            }}
          />
        )}

        {/* The actual table content rendered by Tiptap */}
        <NodeViewContent />

        {/* Add Row button (bottom edge) */}
        {isEditable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="table-add-row-btn"
                onClick={handleAddRow}
                aria-label="Add row"
              >
                <PlusIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-center text-xs">
              <p className="font-medium">Click to add a new row</p>
              <p className="text-muted-foreground">Drag to add or remove rows</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Add Column button (right edge) */}
        {isEditable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="table-add-col-btn"
                onClick={handleAddColumn}
                aria-label="Add column"
              >
                <PlusIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-center text-xs">
              <p className="font-medium">Click to add a new column</p>
              <p className="text-muted-foreground">Drag to add or remove columns</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// ─── Helper: select a cell in a specific column ─────────────────
function selectColumnCell(editor: ReturnType<typeof import("@tiptap/react").useEditor> & object, columnIndex: number): void {
  const editorInstance = editor as import("@tiptap/core").Editor;
  const { state } = editorInstance;
  const { $from } = state.selection;

  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === "table") {
      const tableStart = $from.before(d) + 1;
      const firstRow = node.child(0);
      let cellOffset = tableStart + 1; // +1 for row opening

      for (let cellIdx = 0; cellIdx < firstRow.childCount; cellIdx++) {
        const cell = firstRow.child(cellIdx);
        if (cellIdx === columnIndex) {
          // Set selection inside this cell
          editorInstance.commands.setTextSelection(cellOffset + 1);
          return;
        }
        cellOffset += cell.nodeSize;
      }
      return;
    }
  }
}

// ─── Tiny inline icons for the context menu ─────────────────────
function ColorSwatchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="13.5" r="2.5" />
      <circle cx="17.5" cy="13.5" r="2.5" />
      <path d="M12 21a9 9 0 0 0 0-18" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 5 7 7-7 7" />
      <path d="M5 12h14" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16V4a2 2 0 0 1 2-2h12" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
