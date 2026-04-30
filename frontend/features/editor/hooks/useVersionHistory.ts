"use client";

import { useState, useEffect, useCallback } from "react";
import type { DecryptedNoteVersion, Note } from "@/features/workspace";
import { versionHistoryService, noteService } from "@/features/workspace";
import { logService } from "@/services/log.service";
import { VERSION_RESTORED_EVENT } from "../constants/editor.constants";

interface UseVersionHistoryOptions {
  noteId: string;
  spaceId: string;
  isOpen: boolean;
}

interface UseVersionHistoryReturn {
  versions: DecryptedNoteVersion[];
  isLoading: boolean;
  error: string | null;
  selectedVersion: DecryptedNoteVersion | null;
  selectVersion: (version: DecryptedNoteVersion) => void;
  restoreVersion: () => Promise<void>;
  isRestoring: boolean;
}

/**
 * Hook that manages version history state:
 * fetches, decrypts, and provides restore functionality.
 */
export function useVersionHistory({
  noteId,
  spaceId,
  isOpen,
}: Readonly<UseVersionHistoryOptions>): UseVersionHistoryReturn {
  const [versions, setVersions] = useState<DecryptedNoteVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] =
    useState<DecryptedNoteVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (!isOpen || !noteId || !spaceId) {
      return;
    }

    let cancelled = false;

    async function fetchVersions() {
      setIsLoading(true);
      setError(null);

      try {
        const remoteVersions = await versionHistoryService.getVersions(noteId);

        const decrypted: DecryptedNoteVersion[] = [];

        for (const rv of remoteVersions) {
          const dv = await versionHistoryService.decryptVersion(rv, spaceId);
          if (dv && !cancelled) {
            decrypted.push(dv);
          }
        }

        if (!cancelled) {
          setVersions(decrypted);
          // Auto-select the most recent version (first in list)
          if (decrypted.length > 0) {
            setSelectedVersion(decrypted[0]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Failed to load versions";
          setError(message);
          logService.error("Failed to fetch version history", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchVersions();

    return () => {
      cancelled = true;
    };
  }, [isOpen, noteId, spaceId]);

  const selectVersion = useCallback((version: DecryptedNoteVersion) => {
    setSelectedVersion(version);
  }, []);

  const restoreVersion = useCallback(async () => {
    if (!selectedVersion || !noteId) return;

    setIsRestoring(true);

    try {
      const updates: Partial<Omit<Note, "id" | "createdAt">> = {
        title: selectedVersion.title,
        emoji: selectedVersion.emoji,
        coverImage: selectedVersion.coverImage,
        content: selectedVersion.content,
      };

      await noteService.updateNote(noteId, updates);

      // Notify the active editor to refresh its content instantly
      window.dispatchEvent(
        new CustomEvent(VERSION_RESTORED_EVENT, {
          detail: { noteId, ...updates },
        }),
      );
    } catch (err) {
      logService.error("Failed to restore version", err);
      throw err;
    } finally {
      setIsRestoring(false);
    }
  }, [selectedVersion, noteId]);

  return {
    versions,
    isLoading,
    error,
    selectedVersion,
    selectVersion,
    restoreVersion,
    isRestoring,
  };
}
