/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { Boot } from "./Boot";

export type SecondarySidebarType = "recent" | "shared" | "private" | null;

interface AppShellContextValue {
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
  const [secondarySidebarType, setSecondarySidebarType] =
    useState<SecondarySidebarType>(null);

  const openSecondarySidebar = useCallback((type: SecondarySidebarType) => {
    setSecondarySidebarType(type);
  }, []);

  const closeSecondarySidebar = useCallback(() => {
    setSecondarySidebarType(null);
  }, []);

  return (
    <AppShellContext.Provider
      value={{
        secondarySidebarType,
        openSecondarySidebar,
        closeSecondarySidebar,
      }}
    >
      <Boot>{children}</Boot>
    </AppShellContext.Provider>
  );
}
