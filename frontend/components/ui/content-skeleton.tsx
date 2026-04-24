import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface ContentSkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

/**
 * A single skeleton line — the atomic building block for content skeletons.
 * Defaults to full width and a standard text-line height.
 */
export function ContentSkeletonLine({
  width = "100%",
  height = "0.75rem",
  className,
}: ContentSkeletonLineProps) {
  return (
    <Skeleton
      className={cn("rounded-md", className)}
      style={{ width, height }}
    />
  );
}

interface ContentSkeletonBlockProps {
  /** Number of lines in this block */
  lines?: number;
  /** Width of the last line (shorter to look realistic). Defaults to "60%". */
  lastLineWidth?: string;
  /** Gap between lines. Defaults to "gap-3". */
  gap?: string;
  className?: string;
}

/**
 * A paragraph-shaped skeleton block — multiple lines with the last one shorter.
 * Compose several of these to build a full page skeleton.
 */
export function ContentSkeletonBlock({
  lines = 3,
  lastLineWidth = "60%",
  gap = "gap-3",
  className,
}: ContentSkeletonBlockProps) {
  return (
    <div className={cn("flex flex-col", gap, className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <ContentSkeletonLine
          key={i}
          width={i === lines - 1 ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
}

interface ContentSkeletonHeaderProps {
  /** Show a large title skeleton. Defaults to true. */
  showTitle?: boolean;
  /** Show a subtitle / meta line. Defaults to false. */
  showSubtitle?: boolean;
  /** Show an emoji-sized circle skeleton. Defaults to false. */
  showEmoji?: boolean;
  className?: string;
}

/**
 * A header skeleton — title, optional subtitle, and optional emoji placeholder.
 * Mirrors the shape of the NoteEditorSurface header area.
 */
export function ContentSkeletonHeader({
  showTitle = true,
  showSubtitle = false,
  showEmoji = false,
  className,
}: ContentSkeletonHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {showEmoji && <Skeleton className="size-[72px] rounded-2xl" />}
      {showTitle && <ContentSkeletonLine width="45%" height="2.25rem" />}
      {showSubtitle && <ContentSkeletonLine width="30%" height="0.875rem" />}
    </div>
  );
}
