"use client";

import { cn } from "@/lib/utils";
import { useAppShell } from "../AppShell";
import { LAYOUT_CONFIG } from "../layout.constants";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { SidebarNavTabs } from "./SidebarNavTabs";
import { SidebarSection } from "./SidebarSection";
import { SidebarPageItem } from "./SidebarPageItem";
import { SidebarNewButton } from "./SidebarNewButton";
import {
  useDocuments,
  useCreateDocument,
  useSyncQueue,
} from "@/features/workspace";

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAppShell();
  const { data: documents = [] } = useDocuments();
  const { mutate: createDocument } = useCreateDocument();

  // Start background sync queue
  useSyncQueue();

  const handleCreateDocument = () => {
    createDocument(undefined);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden",
        "transition-all ease-in-out",
      )}
      style={{
        width: isSidebarOpen
          ? `${LAYOUT_CONFIG.SIDEBAR_WIDTH}px`
          : `${LAYOUT_CONFIG.SIDEBAR_COLLAPSED_WIDTH}px`,
        transitionDuration: `${LAYOUT_CONFIG.TRANSITION_DURATION}ms`,
      }}
      aria-label="Sidebar navigation"
    >
      {/* Prevent content from shrinking during collapse */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ minWidth: `${LAYOUT_CONFIG.SIDEBAR_WIDTH}px` }}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarUserProfile
            username="Taranjeet Singh"
            avatarEmoji="😎"
            onCloseSidebar={toggleSidebar}
          />
          <SidebarNavTabs />

          <SidebarSection label="Private">
            {documents.map((doc) => (
              <SidebarPageItem
                key={doc.id}
                emoji={doc.emoji}
                title={doc.title}
              />
            ))}
          </SidebarSection>
        </div>

        {/* Sticky bottom */}
        <SidebarNewButton onCreateDocument={handleCreateDocument} />
      </div>
    </aside>
  );
}
