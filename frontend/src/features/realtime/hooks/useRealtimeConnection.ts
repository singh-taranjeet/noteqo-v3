import { useEffect } from "react";
import { eventSourceService } from "../services/event-source.service";

/**
 * Manages the SSE connection lifecycle.
 * Opens the connection when spaceIds are available,
 * closes it when the component unmounts or spaceIds change.
 *
 * Mount this once at the app shell level (e.g., in a layout component).
 */
export function useRealtimeConnection(spaceIds: string[]): void {
  // Use a string representation to avoid re-triggering effect on referential equality changes
  const spaceIdsStr = [...spaceIds].sort().join(",");

  useEffect(() => {
    if (!spaceIdsStr) {
      eventSourceService.disconnect();
      return;
    }

    const ids = spaceIdsStr.split(",");
    void eventSourceService.connect(ids);

    return () => {
      eventSourceService.disconnect();
    };
  }, [spaceIdsStr]);
}
