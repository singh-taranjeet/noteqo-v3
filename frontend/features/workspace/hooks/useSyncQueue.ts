"use client";

import { useEffect } from "react";
import { noteSyncQueueService } from "../services/note-sync-queue.service";
import { spaceSyncQueueService } from "@/features/spaces/services/space-sync-queue.service";

/**
 * Starts the background sync queue on mount, stops on unmount.
 * Place this in the workspace layout so it runs for all workspace pages.
 */
export function useSyncQueue(): void {
  useEffect(() => {
    noteSyncQueueService.start();
    spaceSyncQueueService.start();
    return () => {
      noteSyncQueueService.stop();
      spaceSyncQueueService.stop();
    };
  }, []);
}
