import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import {
  VERSION_API_ROUTES,
  SYNC_CONFIG,
} from "../constants/workspace.constants";
import type {
  RemoteNoteVersion,
  DecryptedNoteVersion,
} from "../types/workspace.types";
import { spaceService } from "@/features/spaces/services/space.service";
import { cryptoService } from "@/features/crypto";
import { NOTE_FALLBACKS } from "@/features/spaces";
import { logService } from "@/services/log.service";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: SYNC_CONFIG.MAX_RETRY_COUNT,
      retryDelay: SYNC_CONFIG.BASE_BACKOFF_MS,
    },
    mutations: {
      retry: SYNC_CONFIG.MAX_RETRY_COUNT,
      retryDelay: SYNC_CONFIG.BASE_BACKOFF_MS,
    },
  },
});

export const versionQueryKeys = {
  all: ["versions"] as const,
  lists: (noteId: string) => [...versionQueryKeys.all, "list", noteId] as const,
};

export const versionHistoryService = {
  /**
   * Fetches all version snapshots for a note from the remote API.
   */
  async getVersions(noteId: string): Promise<RemoteNoteVersion[]> {
    return queryClient.fetchQuery({
      queryKey: versionQueryKeys.lists(noteId),
      queryFn: async () => {
        const response: { data: RemoteNoteVersion[] } = await apiClient.get(
          VERSION_API_ROUTES.VERSIONS(noteId),
          { auth: true },
        );
        return response.data;
      },
      staleTime: SYNC_CONFIG.CACHE_STALE_TIME_MS,
    });
  },

  /**
   * Decrypts a single version snapshot using the space key.
   * Returns a fully hydrated DecryptedNoteVersion with title, emoji, etc.
   */
  async decryptVersion(
    version: RemoteNoteVersion,
    spaceId: string,
  ): Promise<DecryptedNoteVersion | null> {
    try {
      if (!version.ciphertext?.includes(":")) {
        logService.warn(`Invalid ciphertext format for version ${version.id}`);
        return null;
      }

      const spaceKeyBytes = await spaceService.getSpaceKeyBytes(spaceId);
      const jsonStr = await cryptoService.decryptString(
        version.ciphertext,
        spaceKeyBytes,
      );

      const payload = JSON.parse(jsonStr) as {
        title?: string;
        emoji?: string;
        coverImage?: string;
        content?: unknown;
      };

      return {
        id: version.id,
        noteId: version.noteId,
        version: version.version,
        title: payload.title ?? NOTE_FALLBACKS.TITLE,
        emoji: payload.emoji ?? NOTE_FALLBACKS.EMOJI,
        coverImage: payload.coverImage ?? NOTE_FALLBACKS.COVER_IMAGE,
        content: payload.content ?? null,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt,
        createdBy: version.createdBy,
        updatedBy: version.updatedBy,
      };
    } catch (e) {
      logService.error(
        "Failed to decrypt version " + version.id + ": " + JSON.stringify(e),
      );
      return null;
    }
  },
};
