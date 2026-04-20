import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SidebarPageItemProps {
  id: string;
  emoji: string;
  title: string;
  isActive?: boolean;
}

export function SidebarPageItem({
  id,
  emoji,
  title,
  isActive = false,
}: SidebarPageItemProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "flex w-full items-center justify-start gap-2 px-3 h-7 text-sm font-normal",
      )}
      asChild
    >
      <Link href={`/notes/${id}`}>
        <span className="shrink-0 text-base" role="img" aria-hidden="true">
          {emoji}
        </span>
        <span className="truncate">{title}</span>
      </Link>
    </Button>
  );
}
