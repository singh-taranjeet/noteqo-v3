"use client";
import { Loader2 } from "lucide-react";

import { useDecryptMedia } from "@/features/media/hooks/useDecryptMedia";
import { cn } from "@/lib/utils";

const VERCEL_BLOB_PATTERN = ".public.blob.vercel-storage.com";
const REVOKE_URL_DELAY_MS = 10_000;

interface EncryptedImageProps {
  src: string;
  alt: string;
  spaceId?: string;
  className?: string;
}

/**
 * Renders an image that may or may not be encrypted.
 *
 * - External URLs (e.g. Unsplash) are rendered directly via `<img>`.
 * - Vercel Blob URLs are assumed encrypted and are fetched, decrypted,
 *   and rendered via an object URL using `useDecryptMedia`.
 */
export function EncryptedImage({
  src,
  alt,
  spaceId,
  className,
}: EncryptedImageProps) {
  const isEncrypted = src.includes(VERCEL_BLOB_PATTERN);

  const { objectUrl, isDecrypting } = useDecryptMedia({
    url: isEncrypted ? src : undefined,
    spaceId,
    mimeType: "image/jpeg",
    defaultMimeType: "image/jpeg",
    uploading: false,
    revokeDelayMs: REVOKE_URL_DELAY_MS,
  });

  if (!isEncrypted) {
    // Plain external URL — render directly
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }

  if (isDecrypting) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted", className)}
      >
        <Loader2 className="animate-spin h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-sm",
          className,
        )}
      >
        Failed to load image
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={objectUrl} alt={alt} className={className} />;
}
