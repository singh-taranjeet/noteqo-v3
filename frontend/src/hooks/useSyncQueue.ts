import { useEffect } from "react";
import { syncOrchestrator } from "@/services/sync-orchestrator.service";

/**
 * Starts the global background sync orchestrator on mount, stops on unmount.
 * The orchestrator ensures strict FIFO processing across all entities.
 * Place this in the workspace layout so it runs for all workspace pages.
 */
export function useSyncQueue(): void {
  useEffect(() => {
    syncOrchestrator.start();
    return () => {
      syncOrchestrator.stop();
    };
  }, []);
}
