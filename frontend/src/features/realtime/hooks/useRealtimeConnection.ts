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
  // Use a string representation to avoid re-triggering effect on referential equality changes
  const spaceIdsStr = [...spaceIds].sort().join(",");

  useEffect(() => {
    if (!spaceIdsStr) {
      console.log("Space ids length = 0; disconnecting");
      eventSourceService.disconnect();
      return;
    }

    const ids = spaceIdsStr.split(",");
    void eventSourceService.connect(ids);

    return () => {
      console.log("Space ids changed; disconnecting", ids);
      eventSourceService.disconnect();
    };
  }, [spaceIdsStr]);
}
