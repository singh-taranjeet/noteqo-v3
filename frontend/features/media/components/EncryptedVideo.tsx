"use client";
import { Loader2 } from "lucide-react";
import React from "react";
import { useDecryptMedia } from "@/features/media/hooks/useDecryptMedia";
import { cn } from "@/lib/utils";

const VERCEL_BLOB_PATTERN = ".public.blob.vercel-storage.com";
const REVOKE_URL_DELAY_MS = 10_000;

interface EncryptedVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  spaceId?: string;
  className?: string;
  mimeType?: string;
}

/**
 * Renders a video that may or may not be encrypted.
 *
 * - External URLs are rendered directly via `<video>`.
 * - Vercel Blob URLs are assumed encrypted and are fetched, decrypted,
 *   and rendered via an object URL using `useDecryptMedia`.
 */
export function EncryptedVideo({
  src,
  spaceId,
  className,
  mimeType = "video/mp4",
  ...props
}: EncryptedVideoProps) {
  const isEncrypted = src.includes(VERCEL_BLOB_PATTERN);

  const { objectUrl, isDecrypting } = useDecryptMedia({
    url: isEncrypted ? src : undefined,
    spaceId,
    mimeType,
    defaultMimeType: "video/mp4",
    uploading: false,
    revokeDelayMs: REVOKE_URL_DELAY_MS,
  });

  if (!isEncrypted) {
    // Plain external URL — render directly
    return <video src={src} className={className} {...props} />;
  }

  if (isDecrypting) {
    return (
      <div
        className={cn("flex items-center justify-center bg-muted", className)}
      >
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
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
        Failed to load video
      </div>
    );
  }

  return <video src={objectUrl} className={className} {...props} />;
}
