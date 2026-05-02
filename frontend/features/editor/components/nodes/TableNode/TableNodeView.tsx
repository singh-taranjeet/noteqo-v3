"use client";

import React, { useState, useCallback, useRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";
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
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────────────── */

interface TableData {
  headers: string[];
  rows: string[][];
  columnWidths: (number | null)[];
}

/* ─── Constants ──────────────────────────────────────────────── */

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;
const MIN_COL_WIDTH = 80;
const RESIZE_HANDLE_WIDTH = 4;

const COLUMN_COLORS: Array<{
  label: string;
  value: string | null;
  swatch: string;
}> = [
  { label: "Default", value: null, swatch: "transparent" },
  { label: "Gray", value: "#f5f5f5", swatch: "#f5f5f5" },
  { label: "Blue", value: "#dbeafe", swatch: "#dbeafe" },
  { label: "Green", value: "#dcfce7", swatch: "#dcfce7" },
  { label: "Yellow", value: "#fef9c3", swatch: "#fef9c3" },
  { label: "Red", value: "#fee2e2", swatch: "#fee2e2" },
  { label: "Purple", value: "#f3e8ff", swatch: "#f3e8ff" },
];

/* ─── Helpers ────────────────────────────────────────────────── */

function parseTableData(raw: string): TableData {
  try {
    const parsed = JSON.parse(raw) as TableData;
    if (parsed.headers && parsed.rows) return parsed;
  } catch {
    /* fall through */
  }
  // Return default 3x3
  return {
    headers: Array.from({ length: DEFAULT_COLS }, () => ""),
    rows: Array.from({ length: DEFAULT_ROWS - 1 }, () =>
      Array.from({ length: DEFAULT_COLS }, () => ""),
    ),
    columnWidths: Array.from({ length: DEFAULT_COLS }, () => null),
  };
}

/* ─── Component ──────────────────────────────────────────────── */

export const TableNodeView = ({
  node,
  updateAttributes,
  editor,
}: NodeViewProps) => {
  const data = parseTableData(node.attrs.tableData as string);
  const [isHovered, setIsHovered] = useState(false);
  const [dragCol, setDragCol] = useState<number | null>(null);
  const dragColRef = useRef<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const dropTargetRef = useRef<number | null>(null);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [menuCol, setMenuCol] = useState(-1);
  const tableRef = useRef<HTMLDivElement>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const setDragColSafe = useCallback((val: number | null) => {
    setDragCol(val);
    dragColRef.current = val;
  }, []);

  const setDropTargetSafe = useCallback((val: number | null) => {
    setDropTarget(val);
    dropTargetRef.current = val;
  }, []);

  const colCount = data.headers.length;
  const isEditable = editor.isEditable;

  /* ─── Persist changes ─────────────────────────────────────── */

  const persist = useCallback(
    (next: TableData) => {
      updateAttributes({ tableData: JSON.stringify(next) });
    },
    [updateAttributes],
  );

  /* ─── Cell editing ────────────────────────────────────────── */

  const updateHeader = useCallback(
    (colIdx: number, value: string) => {
      const next = { ...data, headers: [...data.headers] };
      next.headers[colIdx] = value;
      persist(next);
    },
    [data, persist],
  );

  const updateCell = useCallback(
    (rowIdx: number, colIdx: number, value: string) => {
      const next = {
        ...data,
        rows: data.rows.map((r) => [...r]),
      };
      next.rows[rowIdx][colIdx] = value;
      persist(next);
    },
    [data, persist],
  );

  /* ─── Add row / column ────────────────────────────────────── */

  const addRow = useCallback(() => {
    const next = {
      ...data,
      rows: [...data.rows, Array.from({ length: colCount }, () => "")],
    };
    persist(next);
  }, [data, colCount, persist]);

  const addColumn = useCallback(() => {
    const next: TableData = {
      headers: [...data.headers, ""],
      rows: data.rows.map((r) => [...r, ""]),
      columnWidths: [...data.columnWidths, null],
    };
    persist(next);
  }, [data, persist]);

  /* ─── Delete row / column ─────────────────────────────────── */

  const deleteColumn = useCallback(
    (colIdx: number) => {
      if (colCount <= 1) return;
      const next: TableData = {
        headers: data.headers.filter((_, i) => i !== colIdx),
        rows: data.rows.map((r) => r.filter((_, i) => i !== colIdx)),
        columnWidths: data.columnWidths.filter((_, i) => i !== colIdx),
      };
      persist(next);
    },
    [data, colCount, persist],
  );

  const insertColumnBefore = useCallback(
    (colIdx: number) => {
      const next: TableData = {
        headers: [
          ...data.headers.slice(0, colIdx),
          "",
          ...data.headers.slice(colIdx),
        ],
        rows: data.rows.map((r) => [
          ...r.slice(0, colIdx),
          "",
          ...r.slice(colIdx),
        ]),
        columnWidths: [
          ...data.columnWidths.slice(0, colIdx),
          null,
          ...data.columnWidths.slice(colIdx),
        ],
      };
      persist(next);
    },
    [data, persist],
  );

  const insertColumnAfter = useCallback(
    (colIdx: number) => {
      const next: TableData = {
        headers: [
          ...data.headers.slice(0, colIdx + 1),
          "",
          ...data.headers.slice(colIdx + 1),
        ],
        rows: data.rows.map((r) => [
          ...r.slice(0, colIdx + 1),
          "",
          ...r.slice(colIdx + 1),
        ]),
        columnWidths: [
          ...data.columnWidths.slice(0, colIdx + 1),
          null,
          ...data.columnWidths.slice(colIdx + 1),
        ],
      };
      persist(next);
    },
    [data, persist],
  );

  const clearColumnContents = useCallback(
    (colIdx: number) => {
      const next: TableData = {
        ...data,
        headers: data.headers.map((h, i) => (i === colIdx ? "" : h)),
        rows: data.rows.map((r) => r.map((c, i) => (i === colIdx ? "" : c))),
      };
      persist(next);
    },
    [data, persist],
  );

  /* ─── Column Resize ───────────────────────────────────────── */

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, colIdx: number) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingCol(colIdx);
      resizeStartX.current = e.clientX;

      // Measure current column width from DOM
      const table = tableRef.current?.querySelector("table");
      if (table) {
        const th = table.querySelectorAll("th")[colIdx];
        if (th) {
          resizeStartWidth.current = th.getBoundingClientRect().width;
        }
      }

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - resizeStartX.current;
        const newWidth = Math.max(
          MIN_COL_WIDTH,
          resizeStartWidth.current + delta,
        );
        const next: TableData = {
          ...data,
          columnWidths: data.columnWidths.map((w, i) =>
            i === colIdx ? newWidth : w,
          ),
        };
        persist(next);
      };

      const onMouseUp = () => {
        setResizingCol(null);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [data, persist],
  );

  /* ─── Column widths style ─────────────────────────────────── */

  const getColStyle = (colIdx: number): React.CSSProperties => {
    const w = data.columnWidths[colIdx];
    if (w) return { width: `${w}px`, minWidth: `${MIN_COL_WIDTH}px` };
    return { minWidth: `${MIN_COL_WIDTH}px` };
  };

  /* ─── Render ──────────────────────────────────────────────── */

  return (
    <NodeViewWrapper
      className="w-full my-4 block not-prose"
      data-type="notion-table"
    >
      <div
        ref={tableRef}
        className="relative group/table"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Drop indicator during column drag ─────────────── */}
        {dragCol !== null && dropTarget !== null && dropTarget !== dragCol && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-30 pointer-events-none"
            style={{
              // eslint-disable-next-line react-hooks/refs
              left: (() => {
                const table = tableRef.current?.querySelector("table");
                if (!table) return 0;
                const headerRow = table.querySelector("thead tr:last-child");
                if (!headerRow) return 0;
                const cells = headerRow.querySelectorAll("th");
                if (cells[dropTarget]) {
                  const rect = cells[dropTarget].getBoundingClientRect();
                  const tableRect = table.getBoundingClientRect();
                  return dropTarget <= dragCol
                    ? rect.left - tableRect.left
                    : rect.right - tableRect.left;
                }
                return 0;
              })(),
            }}
          />
        )}

        {/* ── The actual table ──────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse border border-border">
            {/* Colgroup for width control */}
            <colgroup>
              {data.headers.map((_, colIdx) => (
                <col key={`col-${colIdx}`} style={getColStyle(colIdx)} />
              ))}
            </colgroup>

            <thead>
              {/* ── Grip handles row (inside table for alignment) ── */}
              {isEditable && (
                <tr
                  className={cn(
                    "transition-opacity duration-150",
                    isHovered ? "opacity-100" : "opacity-0",
                  )}
                >
                  {data.headers.map((_, colIdx) => (
                    <th
                      key={`grip-${colIdx}`}
                      className="border-none p-0 bg-transparent"
                    >
                      <div className="flex justify-center pb-1">
                        <ColumnGripButton
                          colIdx={colIdx}
                          menuCol={menuCol}
                          setMenuCol={setMenuCol}
                          dragCol={dragCol}
                          onDragStart={setDragColSafe}
                          onDragMove={(clientX) => {
                            const table =
                              tableRef.current?.querySelector("table");
                            if (!table) return;
                            const headerRow = table.querySelector(
                              "thead tr:last-child",
                            );
                            if (!headerRow) return;
                            const cells = headerRow.querySelectorAll("th");
                            let closest = 0;
                            let closestDist = Infinity;
                            cells.forEach((cell, i) => {
                              const rect = cell.getBoundingClientRect();
                              const center = rect.left + rect.width / 2;
                              const dist = Math.abs(clientX - center);
                              if (dist < closestDist) {
                                closestDist = dist;
                                closest = i;
                              }
                            });
                            setDropTargetSafe(closest);
                          }}
                          onDragEnd={(fromIdx) => {
                            const currentDropTarget = dropTargetRef.current;
                            if (
                              currentDropTarget !== null &&
                              fromIdx !== currentDropTarget
                            ) {
                              const reorder = <T,>(arr: T[]): T[] => {
                                const result = [...arr];
                                const [moved] = result.splice(fromIdx, 1);
                                result.splice(currentDropTarget, 0, moved);
                                return result;
                              };
                              const next: TableData = {
                                headers: reorder(data.headers),
                                rows: data.rows.map((r) => reorder(r)),
                                columnWidths: reorder(data.columnWidths),
                              };
                              persist(next);
                            }
                            setDragColSafe(null);
                            setDropTargetSafe(null);
                          }}
                          insertColumnBefore={insertColumnBefore}
                          insertColumnAfter={insertColumnAfter}
                          clearColumnContents={clearColumnContents}
                          deleteColumn={deleteColumn}
                          colCount={colCount}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              )}

              {/* ── Actual header row ─────────────────────────── */}
              <tr>
                {data.headers.map((header, colIdx) => (
                  <th
                    key={`th-${colIdx}`}
                    className={cn(
                      "border border-border px-3 py-2 text-left font-semibold bg-muted text-foreground relative",
                      dragCol === colIdx && "opacity-50",
                    )}
                  >
                    {isEditable ? (
                      <input
                        type="text"
                        className="w-full bg-transparent border-none outline-none text-sm font-semibold placeholder:text-muted-foreground"
                        value={header}
                        onChange={(e) => updateHeader(colIdx, e.target.value)}
                        placeholder="Header"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {header || "Header"}
                      </span>
                    )}

                    {/* Resize handle */}
                    {isEditable && (
                      <div
                        className={cn(
                          "absolute top-0 right-0 bottom-0 cursor-col-resize z-10 hover:bg-primary/40 transition-colors duration-100",
                          resizingCol === colIdx ? "bg-primary" : "",
                        )}
                        style={{ width: `${RESIZE_HANDLE_WIDTH}px` }}
                        onMouseDown={(e) => handleResizeStart(e, colIdx)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body rows */}
            <tbody>
              {data.rows.map((row, rowIdx) => (
                <tr key={`row-${rowIdx}`}>
                  {row.map((cell, colIdx) => (
                    <td
                      key={`cell-${rowIdx}-${colIdx}`}
                      className={cn(
                        "border border-border px-3 py-2 align-top relative",
                        dragCol === colIdx && "opacity-50",
                      )}
                    >
                      {isEditable ? (
                        <input
                          type="text"
                          className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                          value={cell}
                          onChange={(e) =>
                            updateCell(rowIdx, colIdx, e.target.value)
                          }
                          placeholder=""
                        />
                      ) : (
                        <span className="text-sm">{cell}</span>
                      )}

                      {/* Resize handle */}
                      {isEditable && (
                        <div
                          className={cn(
                            "absolute top-0 right-0 bottom-0 cursor-col-resize z-10 hover:bg-primary/40 transition-colors duration-100",
                            resizingCol === colIdx ? "bg-primary" : "",
                          )}
                          style={{ width: `${RESIZE_HANDLE_WIDTH}px` }}
                          onMouseDown={(e) => handleResizeStart(e, colIdx)}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Add Row button (bottom) ───────────────────────── */}
        {isEditable && (
          <button
            onClick={addRow}
            className={cn(
              "w-full h-5 flex items-center justify-center",
              "bg-muted/50 hover:bg-muted text-muted-foreground",
              "rounded-b-md cursor-pointer transition-all duration-150 border border-t-0 border-border",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            aria-label="Add row"
          >
            <PlusIcon />
          </button>
        )}

        {/* ── Add Column button (right side) ────────────────── */}
        {isEditable && (
          <button
            onClick={addColumn}
            className={cn(
              "absolute right-[-20px] top-0 bottom-0 w-5 flex items-center justify-center",
              "bg-muted/50 hover:bg-muted text-muted-foreground",
              "rounded-r-md cursor-pointer transition-all duration-150 border border-l-0 border-border",
              isHovered ? "opacity-100" : "opacity-0",
            )}
            aria-label="Add column"
          >
            <PlusIcon />
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
};

/* ─── Column Grip Button ─────────────────────────────────────
   Separates click (opens context menu) from drag (reorders columns).
   Uses mousedown + mousemove threshold instead of HTML5 DnD
   so it doesn't conflict with the DropdownMenu trigger.        */

const DRAG_THRESHOLD = 5;

interface ColumnGripButtonProps {
  colIdx: number;
  menuCol: number;
  setMenuCol: (col: number) => void;
  dragCol: number | null;
  onDragStart: (colIdx: number) => void;
  onDragMove: (clientX: number) => void;
  onDragEnd: (fromIdx: number) => void;
  insertColumnBefore: (colIdx: number) => void;
  insertColumnAfter: (colIdx: number) => void;
  clearColumnContents: (colIdx: number) => void;
  deleteColumn: (colIdx: number) => void;
  colCount: number;
}

function ColumnGripButton({
  colIdx,
  menuCol,
  setMenuCol,
  dragCol,
  onDragStart,
  onDragMove,
  onDragEnd,
  insertColumnBefore,
  insertColumnAfter,
  clearColumnContents,
  deleteColumn,
  colCount,
}: ColumnGripButtonProps) {
  const isDraggingRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      isDraggingRef.current = false;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dx = Math.abs(moveEvent.clientX - startX);
        const dy = Math.abs(moveEvent.clientY - startY);

        if (
          !isDraggingRef.current &&
          (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)
        ) {
          isDraggingRef.current = true;
          onDragStart(colIdx);
        }

        if (isDraggingRef.current) {
          onDragMove(moveEvent.clientX);
        }
      };

      const handlePointerUp = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);

        if (isDraggingRef.current) {
          onDragEnd(colIdx);
          isDraggingRef.current = false;
        } else {
          // It was a click — toggle the dropdown menu
          setMenuCol(menuCol === colIdx ? -1 : colIdx);
        }
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [colIdx, menuCol, setMenuCol, onDragStart, onDragMove, onDragEnd],
  );

  return (
    <DropdownMenu
      open={menuCol === colIdx}
      onOpenChange={(open) => {
        if (!open) setMenuCol(-1);
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          onPointerDown={handlePointerDown}
          className={cn(
            "flex items-center justify-center w-6 h-5 cursor-grab active:cursor-grabbing",
            "bg-background border border-border rounded-sm text-muted-foreground",
            "hover:bg-muted transition-colors duration-150",
            dragCol === colIdx && "opacity-50",
          )}
          aria-label={`Column ${colIdx + 1} options`}
        >
          <GripDotsIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex items-center gap-2">
              <PaletteIcon /> Color
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {COLUMN_COLORS.map((color) => (
              <DropdownMenuItem
                key={color.label}
                onClick={() => setMenuCol(-1)}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded border border-border"
                    style={{ backgroundColor: color.swatch }}
                  />
                  {color.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            insertColumnBefore(colIdx);
            setMenuCol(-1);
          }}
        >
          <span className="flex items-center gap-2">
            <ArrowLeftIcon /> Insert left
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            insertColumnAfter(colIdx);
            setMenuCol(-1);
          }}
        >
          <span className="flex items-center gap-2">
            <ArrowRightIcon /> Insert right
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            insertColumnAfter(colIdx);
            setMenuCol(-1);
          }}
        >
          <span className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <DuplicateIcon /> Duplicate
            </span>
            <kbd className="text-xs text-muted-foreground">⌘D</kbd>
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            clearColumnContents(colIdx);
            setMenuCol(-1);
          }}
        >
          <span className="flex items-center gap-2">
            <ClearIcon /> Clear contents
          </span>
        </DropdownMenuItem>
        {colCount > 1 && (
          <DropdownMenuItem
            onClick={() => {
              deleteColumn(colIdx);
              setMenuCol(-1);
            }}
            className="text-destructive focus:text-destructive"
          >
            <span className="flex items-center gap-2">
              <TrashIcon /> Delete
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Small inline SVG icons ─────────────────────────────────── */

function PlusIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function GripDotsIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 10 16" fill="currentColor">
      <circle cx="3" cy="2" r="1.5" />
      <circle cx="7" cy="2" r="1.5" />
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="7" cy="8" r="1.5" />
      <circle cx="3" cy="14" r="1.5" />
      <circle cx="7" cy="14" r="1.5" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="13.5" r="2.5" />
      <circle cx="17.5" cy="13.5" r="2.5" />
      <path d="M12 21a9 9 0 0 0 0-18" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 5 7 7-7 7" />
      <path d="M5 12h14" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <path d="M4 16V4a2 2 0 0 1 2-2h12" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
