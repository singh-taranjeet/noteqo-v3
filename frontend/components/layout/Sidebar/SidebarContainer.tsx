"use client";

import { useAppShell } from "../AppShell";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useIsMobile";

export function SidebarContainer({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, isSidebarHovered, setIsSidebarHovered } = useAppShell();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Hover Trigger Zone */}
      {!isSidebarOpen && !isMobile && (
        <div
          className="absolute left-0 top-0 w-8 h-full z-40 cursor-ew-resize"
          onMouseEnter={() => setIsSidebarHovered(true)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={cn(
          "flex h-full shrink-0 z-40 transition-all duration-150 ease-out",
          isSidebarOpen || isMobile
            ? "md:relative absolute shadow-none"
            : "md:absolute absolute shadow-2xl"
        )}
        onMouseLeave={() => {
          if (!isSidebarOpen) {
            setIsSidebarHovered(false);
          }
        }}
      >
        {children}
      </div>
    </>
  );
}
