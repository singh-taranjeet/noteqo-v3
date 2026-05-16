/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { Space } from "../types/spaces.types";
import { useSpaces } from "../hooks/useSpaces";

const STORAGE_KEY = "noteqo_active_space_id";

/** A null activeSpaceId means "All Spaces" */
interface ActiveSpaceContextValue {
  activeSpaceId: string | null;
  activeSpace: Space | null;
  setActiveSpaceId: (spaceId: string | null) => void;
}

const ActiveSpaceContext = createContext<ActiveSpaceContextValue | null>(null);

export function useActiveSpace(): ActiveSpaceContextValue {
  const context = useContext(ActiveSpaceContext);
  if (!context) {
    throw new Error(
      "useActiveSpace must be used within an <ActiveSpaceProvider>",
    );
  }
  return context;
}

interface ActiveSpaceProviderProps {
  children: ReactNode;
}

export function ActiveSpaceProvider({ children }: ActiveSpaceProviderProps) {
  const { data } = useSpaces();
  const { spaces = [] } = data || {};

  const [activeSpaceId, setActiveSpaceIdRaw] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const setActiveSpaceId = useCallback((spaceId: string | null) => {
    setActiveSpaceIdRaw(spaceId);
    try {
      if (spaceId) {
        localStorage.setItem(STORAGE_KEY, spaceId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  // If the stored space no longer exists, fall back to null (All Spaces)
  useEffect(() => {
    if (
      activeSpaceId &&
      spaces.length > 0 &&
      !spaces.find((s) => s.id === activeSpaceId)
    ) {
      setActiveSpaceId(null);
    }
  }, [activeSpaceId, spaces, setActiveSpaceId]);

  const activeSpace = useMemo(() => {
    if (!activeSpaceId) return null;
    return spaces.find((s) => s.id === activeSpaceId) ?? null;
  }, [activeSpaceId, spaces]);

  const value = useMemo<ActiveSpaceContextValue>(
    () => ({
      activeSpaceId,
      activeSpace,
      setActiveSpaceId,
    }),
    [activeSpaceId, activeSpace, setActiveSpaceId],
  );

  return (
    <ActiveSpaceContext.Provider value={value}>
      {children}
    </ActiveSpaceContext.Provider>
  );
}
