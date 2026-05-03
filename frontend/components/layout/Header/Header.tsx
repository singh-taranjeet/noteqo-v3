import { HeaderSidebarToggle } from "./HeaderSidebarToggle";
import { HeaderBreadcrumb } from "./HeaderBreadcrumb";
import { HeaderActions } from "./HeaderActions";

const HEADER_HEIGHT = 44;

export function Header() {
  return (
    <header
      className="sticky top-0 z-[49] flex items-center justify-between gap-2 border-b border-border bg-background px-4 shrink-0"
      style={{ height: `${HEADER_HEIGHT}px` }}
    >
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
        <HeaderSidebarToggle />
        <HeaderBreadcrumb />
      </div>

      {/* Right: actions */}
      <HeaderActions />
    </header>
  );
}
