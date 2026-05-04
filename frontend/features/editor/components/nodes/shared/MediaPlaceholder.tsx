"use client";

import React from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Spinner } from "@/components/ui/spinner";

interface MediaLoadingPlaceholderProps {
  message: string;
}

/**
 * Loading/encrypting placeholder shown while media is being processed.
 */
export function MediaLoadingPlaceholder({
  message,
}: Readonly<MediaLoadingPlaceholderProps>) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-md min-h-50 w-full border border-dashed">
      <Spinner className="w-8 h-8 text-muted-foreground mb-4" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

interface MediaErrorPlaceholderProps {
  icon: IconSvgElement;
  message: string;
}

/**
 * Error fallback shown when media decryption or loading fails.
 */
export function MediaErrorPlaceholder({
  icon,
  message,
}: Readonly<MediaErrorPlaceholderProps>) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-destructive/10 rounded-md min-h-50 w-full text-destructive border border-destructive/20">
      <HugeiconsIcon icon={icon} className="mb-2 opacity-50" size={32} />
      <span className="text-sm">{message}</span>
    </div>
  );
}
