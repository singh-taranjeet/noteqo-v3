import { Link } from "react-router-dom";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes.constants";
import { EmojiOrImage } from "@/features/media";

interface SidebarNoteItemProps {
  noteId: string;
  emoji: string;
  title: string;
  spaceId: string;
  /** The sidebar menu button size. Defaults to "sm". */
  size?: "sm" | "default" | "lg";
}

/**
 * Reusable sidebar note row: emoji + title wrapped in a Link.
 * Used in RecentSection, SidebarSpaceCategory, and SecondarySidebar.
 */
export function SidebarNoteItem({
  noteId,
  emoji,
  title,
  size = "sm",
  spaceId,
}: Readonly<SidebarNoteItemProps>) {
  return (
    <SidebarMenuButton asChild size={size}>
      <Link to={ROUTES.NOTE(noteId)}>
        <span className="shrink-0 text-base" role="img" aria-hidden="true">
          <EmojiOrImage emoji={emoji} spaceId={spaceId} />
        </span>
        <span className="text-sm  truncate">{title || "Untitled"}</span>
      </Link>
    </SidebarMenuButton>
  );
}
