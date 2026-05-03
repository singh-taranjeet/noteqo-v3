import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { mediaService } from "../services/media.service";
import { logService } from "@/services/log.service";

interface UseDecryptMediaOptions {
  url: string | undefined | null;
  spaceId: string | undefined;
  mimeType: string | undefined | null;
  defaultMimeType: string;
  uploading: boolean;
  revokeDelayMs: number;
}

interface UseDecryptMediaResult {
  objectUrl: string | null;
  isDecrypting: boolean;
}

/**
 * Manages the lifecycle of fetching, decrypting, and revoking
 * an encrypted media blob URL (image, video, etc).
 *
 * This is the canonical hook for rendering any encrypted media.
 * It handles:
 * 1. Read-through caching (IndexedDB → network fallback via mediaService)
 * 2. React Query for deduplication and memory caching
 * 3. Object URL lifecycle (create on mount, revoke on unmount)
 */
export function useDecryptMedia({
  url,
  spaceId,
  mimeType,
  defaultMimeType,
  uploading,
  revokeDelayMs,
}: UseDecryptMediaOptions): UseDecryptMediaResult {
  const { data: blob, isLoading } = useQuery({
    queryKey: ["media-blob", url],
    queryFn: async () => {
      if (!url || !spaceId || uploading) return null;
      try {
        return await mediaService.fetchAndDecryptMedia(
          url,
          spaceId,
          mimeType || defaultMimeType,
        );
      } catch (err) {
        logService.error("Failed to decrypt media", err);
        throw err;
      }
    },
    enabled: !!url && !!spaceId && !uploading,
    staleTime: Infinity, // Immutable blobs, no need to ever refetch while mounted
    gcTime: 1000 * 60 * 10, // Cache in memory for 10 mins after unmount
  });

  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let createdUrl: string | null = null;
    if (blob) {
      createdUrl = URL.createObjectURL(blob);
      setObjectUrl(createdUrl);
    }

    return () => {
      if (createdUrl) {
        setTimeout(
          () => URL.revokeObjectURL(createdUrl as string),
          revokeDelayMs,
        );
      }
    };
  }, [blob, revokeDelayMs]);

  return { objectUrl, isDecrypting: isLoading };
}
