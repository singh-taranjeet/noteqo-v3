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
import { SPACES_EVENTS } from "../constants/spaces.constants";

export const ACTIVE_SPACE_STORAGE_KEY = "noteqo_active_space_id";

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
      return localStorage.getItem(ACTIVE_SPACE_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const setActiveSpaceId = useCallback((spaceId: string | null) => {
    setActiveSpaceIdRaw(spaceId);
    try {
      if (spaceId) {
        localStorage.setItem(ACTIVE_SPACE_STORAGE_KEY, spaceId);
      } else {
        localStorage.removeItem(ACTIVE_SPACE_STORAGE_KEY);
      }
      window.dispatchEvent(new Event(SPACES_EVENTS.ACTIVE_SPACE_CHANGED));
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  // Listen to external changes from outside React tree (e.g. space.service.ts)
  useEffect(() => {
    const handleExternalChange = () => {
      try {
        const id = localStorage.getItem(ACTIVE_SPACE_STORAGE_KEY);
        setActiveSpaceIdRaw(id || null);
      } catch {
        // ignore
      }
    };
    window.addEventListener(
      SPACES_EVENTS.ACTIVE_SPACE_CHANGED,
      handleExternalChange,
    );
    return () =>
      window.removeEventListener(
        SPACES_EVENTS.ACTIVE_SPACE_CHANGED,
        handleExternalChange,
      );
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
