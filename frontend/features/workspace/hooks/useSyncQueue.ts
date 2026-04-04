import { useEffect } from "react";
import { syncQueueService } from "../services/sync-queue.service";

/**
 * Starts the background sync queue on mount, stops on unmount.
 * Place this in the workspace layout so it runs for all workspace pages.
 */
export function useSyncQueue(): void {
  useEffect(() => {
    syncQueueService.start();
    return () => syncQueueService.stop();
  }, []);
}
