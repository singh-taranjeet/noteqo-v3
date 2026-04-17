import { LAYOUT_CONFIG } from "../layout.constants";
import { HeaderSidebarToggle } from "./HeaderSidebarToggle";
import { HeaderBreadcrumb } from "./HeaderBreadcrumb";
import { HeaderActions } from "./HeaderActions";

export function Header() {
  return (
    <header
      className="flex items-center justify-between gap-2 border-b border-border bg-background px-3 shrink-0"
      style={{ height: `${LAYOUT_CONFIG.HEADER_HEIGHT}px` }}
    >
      {/* Left: toggle + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <HeaderSidebarToggle />
        <HeaderBreadcrumb />
      </div>

      {/* Right: actions */}
      <HeaderActions />
    </header>
  );
}
