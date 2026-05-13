"use client";
import { useQuery } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";

/**
 * Remote sync hook — fetches remote spaces & notes, decrypts, and merges into Dexie.
 * useLiveQuery subscribers pick up the Dexie writes automatically.
 *
 * Uses React Query for:
 * - Periodic polling (every 60s)
 * - Refetch on window focus and reconnect
 * - Deduplication of concurrent requests
 */
export function useRemoteSpaces() {
  useQuery({
    queryKey: ["remote-sync"],
    queryFn: async () => {
      await spaceService.getRemoteSpacesAndNotes();
      return { syncedAt: new Date().toISOString() };
    },
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
