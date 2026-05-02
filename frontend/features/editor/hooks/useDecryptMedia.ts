import { useState, useEffect } from "react";
import { mediaService } from "@/features/media";
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
 */
export function useDecryptMedia({
  url,
  spaceId,
  mimeType,
  defaultMimeType,
  uploading,
  revokeDelayMs,
}: UseDecryptMediaOptions): UseDecryptMediaResult {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    const decryptMedia = async () => {
      if (uploading || !url || !spaceId) return;

      try {
        setIsDecrypting(true);
        const blob = await mediaService.fetchAndDecryptMedia(
          url as string,
          spaceId as string,
          (mimeType as string) || defaultMimeType,
        );

        if (active) {
          createdUrl = URL.createObjectURL(blob);
          setObjectUrl(createdUrl);
        }
      } catch (err) {
        logService.error("Failed to decrypt media", err);
      } finally {
        if (active) {
          setIsDecrypting(false);
        }
      }
    };

    void decryptMedia();

    return () => {
      active = false;
      if (createdUrl) {
        setTimeout(
          () => URL.revokeObjectURL(createdUrl as string),
          revokeDelayMs,
        );
      }
    };
  }, [url, spaceId, uploading, mimeType, defaultMimeType, revokeDelayMs]);

  return { objectUrl, isDecrypting };
}
