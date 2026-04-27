import { useState, useEffect } from "react";
import { mediaService } from "@/features/media/services/media.service";
import { logService } from "@/services/log.service";
import { usePathname } from "next/navigation";

export function useDecryptedMedia(src: string | null) {
  const [decryptedSrc, setDecryptedSrc] = useState<string | null>(null);
  
  // Try to extract the spaceId from the URL pathname.
  // URL pattern: /spaces/[spaceId]/[noteId]
  const pathname = usePathname();
  const spaceIdMatch = pathname?.match(/\/spaces\/([^/]+)/);
  const spaceId = spaceIdMatch ? spaceIdMatch[1] : null;

  useEffect(() => {
    let objectUrl: string | null = null;
    let isMounted = true;

    async function loadDecryptedImage() {
      if (!src) return;

      // If it's a base64 data URI or a local object URL, just use it directly
      if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/")) {
        setDecryptedSrc(src);
        return;
      }

      if (!spaceId) {
        logService.warn("No spaceId found, cannot decrypt.");
        return;
      }

      try {
        const url = await mediaService.getDecryptedMediaUrl(src, spaceId);
        if (isMounted) {
          objectUrl = url;
          setDecryptedSrc(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        logService.error("Failed to decrypt media", err);
      }
    }

    loadDecryptedImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, spaceId]);

  return decryptedSrc;
}
