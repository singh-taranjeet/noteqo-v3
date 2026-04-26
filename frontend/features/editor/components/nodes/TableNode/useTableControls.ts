"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/** Column measurement data for positioning controls. */
export interface ColumnMeasurement {
  index: number;
  left: number;
  width: number;
  right: number;
}

interface TableControlsState {
  /** Measured column positions and widths. */
  columns: ColumnMeasurement[];
  /** Index of the column being dragged, or -1 if not dragging. */
  dragColumnIndex: number;
  /** Index of the column that is the drop target, or -1. */
  dropTargetIndex: number;
  /** Index of the column whose context menu is open, or -1. */
  menuColumnIndex: number;
}

interface UseTableControlsReturn extends TableControlsState {
  /** Ref to attach to the table wrapper DOM element. */
  tableWrapperRef: React.RefObject<HTMLDivElement | null>;
  /** Start dragging a column. */
  startDrag: (columnIndex: number) => void;
  /** Update the drop target while dragging. */
  updateDropTarget: (columnIndex: number) => void;
  /** End the drag operation and return [fromIndex, toIndex] or null. */
  endDrag: () => [number, number] | null;
  /** Cancel the drag operation. */
  cancelDrag: () => void;
  /** Open the context menu for a column. */
  openMenu: (columnIndex: number) => void;
  /** Close the context menu. */
  closeMenu: () => void;
  /** Re-measure column positions. */
  remeasure: () => void;
}

/**
 * Hook for managing table control state: column measurements,
 * drag-and-drop reorder state, and context menu state.
 */
export function useTableControls(): UseTableControlsReturn {
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<TableControlsState>({
    columns: [],
    dragColumnIndex: -1,
    dropTargetIndex: -1,
    menuColumnIndex: -1,
  });

  /** Measure all column header positions from the DOM. */
  const remeasure = useCallback(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    const table = wrapper.querySelector("table");
    if (!table) return;

    // Find all cells in the first row (th or td)
    const firstRow = table.querySelector("tr");
    if (!firstRow) return;

    const cells = firstRow.querySelectorAll("th, td");
    const wrapperRect = wrapper.getBoundingClientRect();

    const measurements: ColumnMeasurement[] = [];
    cells.forEach((cell, index) => {
      const cellRect = cell.getBoundingClientRect();
      measurements.push({
        index,
        left: cellRect.left - wrapperRect.left,
        width: cellRect.width,
        right: cellRect.right - wrapperRect.left,
      });
    });

    setState((prev) => ({ ...prev, columns: measurements }));
  }, []);

  /** Observe the table wrapper for resize changes. */
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(() => {
      remeasure();
    });

    observer.observe(wrapper);

    // Also observe mutations (cells added/removed)
    const mutationObserver = new MutationObserver(() => {
      remeasure();
    });

    mutationObserver.observe(wrapper, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "colspan"],
    });

    // Initial measurement
    remeasure();

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [remeasure]);

  const startDrag = useCallback((columnIndex: number) => {
    setState((prev) => ({
      ...prev,
      dragColumnIndex: columnIndex,
      dropTargetIndex: columnIndex,
      menuColumnIndex: -1,
    }));
  }, []);

  const updateDropTarget = useCallback((columnIndex: number) => {
    setState((prev) => ({ ...prev, dropTargetIndex: columnIndex }));
  }, []);

  const endDrag = useCallback((): [number, number] | null => {
    const { dragColumnIndex, dropTargetIndex } = state;
    setState((prev) => ({
      ...prev,
      dragColumnIndex: -1,
      dropTargetIndex: -1,
    }));

    if (
      dragColumnIndex === -1 ||
      dropTargetIndex === -1 ||
      dragColumnIndex === dropTargetIndex
    ) {
      return null;
    }

    return [dragColumnIndex, dropTargetIndex];
  }, [state]);

  const cancelDrag = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dragColumnIndex: -1,
      dropTargetIndex: -1,
    }));
  }, []);

  const openMenu = useCallback((columnIndex: number) => {
    setState((prev) => ({ ...prev, menuColumnIndex: columnIndex }));
  }, []);

  const closeMenu = useCallback(() => {
    setState((prev) => ({ ...prev, menuColumnIndex: -1 }));
  }, []);

  return {
    ...state,
    tableWrapperRef,
    startDrag,
    updateDropTarget,
    endDrag,
    cancelDrag,
    openMenu,
    closeMenu,
    remeasure,
  };
}
