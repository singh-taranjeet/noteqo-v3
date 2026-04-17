"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface AppShellContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <AppShellContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className="flex h-screen overflow-hidden bg-background">
        {children}
      </div>
    </AppShellContext.Provider>
  );
}
