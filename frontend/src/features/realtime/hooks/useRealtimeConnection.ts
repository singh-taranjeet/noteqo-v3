import { useEffect, useRef } from "react";
import { eventSourceService } from "../services/event-source.service";

/**
 * Manages the SSE connection lifecycle.
 * Opens the connection when spaceIds are available,
 * closes it when the component unmounts or spaceIds change.
 *
 * Mount this once at the app shell level (e.g., in a layout component).
 */
export function useRealtimeConnection(spaceIds: string[]): void {
  const prevIdsRef = useRef<string>("");

  useEffect(() => {
    const key = spaceIds.sort().join(",");

    // Only reconnect if the set of spaces actually changed
    if (key === prevIdsRef.current) return;
    prevIdsRef.current = key;

    if (spaceIds.length === 0) {
      eventSourceService.disconnect();
      return;
    }

    void eventSourceService.connect(spaceIds);

    return () => {
      eventSourceService.disconnect();
    };
  }, [spaceIds]);
}
