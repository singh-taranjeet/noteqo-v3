import { useState, useEffect, useCallback } from "react";
import type React from "react";

interface UseMediaResizeOptions {
  mediaRef: React.RefObject<HTMLElement | null>;
  align: string | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  minWidth?: number;
}

interface UseMediaResizeResult {
  isResizing: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Provides drag-to-resize behavior for media nodes (image, video).
 * Handles alignment-aware resize direction and min-width clamping.
 */
export function useMediaResize({
  mediaRef,
  align,
  updateAttributes,
  minWidth = 100,
}: UseMediaResizeOptions): UseMediaResizeResult {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeState, setResizeState] = useState({ startX: 0, startWidth: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      if (mediaRef.current && mediaRef.current.parentElement) {
        setResizeState({
          startX: e.clientX,
          startWidth:
            mediaRef.current.parentElement.getBoundingClientRect().width,
        });
      }
    },
    [mediaRef],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeState.startX;
      let newWidth = resizeState.startWidth;

      if (align === "center") {
        newWidth = resizeState.startWidth + deltaX * 2;
      } else if (align === "right") {
        newWidth = resizeState.startWidth - deltaX;
      } else {
        newWidth = resizeState.startWidth + deltaX;
      }

      newWidth = Math.max(minWidth, newWidth);
      updateAttributes({ width: `${newWidth}px` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, align, resizeState, updateAttributes, minWidth]);

  return { isResizing, handleMouseDown };
}
