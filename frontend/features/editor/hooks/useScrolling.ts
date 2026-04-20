import type { RefObject } from "react";
import { useEffect, useState } from "react";

type ScrollTarget = RefObject<HTMLElement> | Window | null | undefined;
type EventTargetWithScroll = Window | HTMLElement | Document;

interface UseScrollingOptions {
  debounce?: number;
  fallbackToDocument?: boolean;
}

import { EDITOR_CONFIG } from "@/features/editor/constants/editor.constants";

export function useScrolling(
  target?: ScrollTarget,
  options: UseScrollingOptions = {},
): boolean {
  const { debounce = EDITOR_CONFIG.SCROLL_DEBOUNCE_MS, fallbackToDocument = true } = options;
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const globalWindow = globalThis as unknown as Window;

    // Resolve element or globalThis
    const element: EventTargetWithScroll =
      target === globalWindow
        ? target
        : ((target as RefObject<HTMLElement>)?.current ?? globalWindow);

    // Mobile: fallback to note when using globalThis
    const eventTarget: EventTargetWithScroll =
      fallbackToDocument &&
      element === globalWindow &&
      typeof document !== "undefined"
        ? document
        : element;

    const on = (
      el: EventTargetWithScroll,
      event: string,
      handler: EventListener,
    ) => el.addEventListener(event, handler, true);

    const off = (
      el: EventTargetWithScroll,
      event: string,
      handler: EventListener,
    ) => el.removeEventListener(event, handler);

    let timeout: ReturnType<typeof setTimeout>;
    const supportsScrollEnd =
      element === globalWindow && "onscrollend" in globalThis;

    const handleScroll: EventListener = () => {
      if (!isScrolling) setIsScrolling(true);

      if (!supportsScrollEnd) {
        clearTimeout(timeout);
        timeout = setTimeout(() => setIsScrolling(false), debounce);
      }
    };

    const handleScrollEnd: EventListener = () => setIsScrolling(false);

    on(eventTarget, "scroll", handleScroll);
    if (supportsScrollEnd) {
      on(eventTarget, "scrollend", handleScrollEnd);
    }

    return () => {
      off(eventTarget, "scroll", handleScroll);
      if (supportsScrollEnd) {
        off(eventTarget, "scrollend", handleScrollEnd);
      }
      clearTimeout(timeout);
    };
  }, [target, debounce, fallbackToDocument, isScrolling]);

  return isScrolling;
}
