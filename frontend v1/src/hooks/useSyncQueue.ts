
import { useEffect } from "react";
import { noteSyncQueueService } from "@/features/workspace/services/note-sync-queue.service";
import { spaceSyncQueueService } from "@/features/spaces/services/space-sync-queue.service";
import { mediaSyncQueueService } from "@/features/media/services/media-sync-queue.service";

/**
 * Starts all background sync queues on mount, stops on unmount.
 * Each queue processes its own entity type independently.
 * Place this in the workspace layout so it runs for all workspace pages.
 */
export function useSyncQueue(): void {
  useEffect(() => {
    noteSyncQueueService.start();
    spaceSyncQueueService.start();
    mediaSyncQueueService.start();
    return () => {
      noteSyncQueueService.stop();
      spaceSyncQueueService.stop();
      mediaSyncQueueService.stop();
    };
  }, []);
}
