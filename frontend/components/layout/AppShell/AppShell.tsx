"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

export type SecondarySidebarType = "recent" | "shared" | "private" | null;

interface AppShellContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  secondarySidebarType: SecondarySidebarType;
  openSecondarySidebar: (type: SecondarySidebarType) => void;
  closeSecondarySidebar: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an <AppShell>");
  }
  return context;
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [secondarySidebarType, setSecondarySidebarType] =
    useState<SecondarySidebarType>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const openSecondarySidebar = useCallback((type: SecondarySidebarType) => {
    setSecondarySidebarType(type);
  }, []);

  const closeSecondarySidebar = useCallback(() => {
    setSecondarySidebarType(null);
  }, []);

  return (
    <AppShellContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        secondarySidebarType,
        openSecondarySidebar,
        closeSecondarySidebar,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        {children}
      </div>
    </AppShellContext.Provider>
  );
}
