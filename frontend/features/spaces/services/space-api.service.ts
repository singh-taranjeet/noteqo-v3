import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { SPACES_API_ROUTES } from "../constants/spaces.constants";
import { SYNC_CONFIG } from "../../workspace/constants/workspace.constants";
import type {
  RemoteSpace,
  SpaceNotesResponse,
  SpaceType,
} from "../types/spaces.types";

export interface CreateSpacePayload {
  id: string;
  encryptedName: string; // base64
  type: SpaceType;
  ownerKeySlot: string; // base64 — RSA(spaceKey, ownerPublicKey)
}

export interface CreateSpaceNotePayload {
  id: string;
  ciphertext: string; // base64
  spaceId: string;
  type: string; // 'private' | 'shared'
}

// Create a local query client instance for caching API responses natively
// inside the service layer, maintaining compatibility with existing consumers.
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

export const spaceQueryKeys = {
  all: ["spaces"] as const,
  lists: () => [...spaceQueryKeys.all, "list"] as const,
  detail: (id: string) => [...spaceQueryKeys.all, "detail", id] as const,
  notes: (spaceId: string) => [...spaceQueryKeys.detail(spaceId), "notes"] as const,
};

export const spaceApiService = {
  getAll: async (): Promise<RemoteSpace[]> => {
    return queryClient.fetchQuery({
      queryKey: spaceQueryKeys.lists(),
      queryFn: async () => {
        const res = await apiClient.get<{ data: RemoteSpace[] }>(
          SPACES_API_ROUTES.SPACES,
          { auth: true },
        );
        return res.data;
      },
      staleTime: SYNC_CONFIG.CACHE_STALE_TIME_MS,
    });
  },

  create: async (payload: CreateSpacePayload): Promise<RemoteSpace> => {
    const response = await queryClient.getMutationCache().build(queryClient, {
      mutationFn: async (vars: typeof payload) => {
        const res = await apiClient.post<{ data: RemoteSpace }>(
          SPACES_API_ROUTES.SPACES,
          vars,
          { auth: true },
        );
        return res.data;
      }
    }).execute(payload);
    
    await queryClient.invalidateQueries({ queryKey: spaceQueryKeys.lists() });
    return response as RemoteSpace;
  },

  getNotes: async (spaceId: string): Promise<SpaceNotesResponse> => {
    return queryClient.fetchQuery({
      queryKey: spaceQueryKeys.notes(spaceId),
      queryFn: async () => {
        const res = await apiClient.get<{ data: SpaceNotesResponse }>(
          SPACES_API_ROUTES.SPACE_NOTES(spaceId),
          { auth: true },
        );
        return res.data;
      },
      staleTime: SYNC_CONFIG.CACHE_STALE_TIME_MS,
    });
  },

  createNote: async (
    spaceId: string,
    payload: CreateSpaceNotePayload,
  ): Promise<unknown> => {
    const response = await queryClient.getMutationCache().build(queryClient, {
      mutationFn: async (vars: typeof payload) => {
        const res = await apiClient.post<{ data: unknown }>(
          SPACES_API_ROUTES.SPACE_NOTES(spaceId),
          vars,
          { auth: true },
        );
        return res.data;
      }
    }).execute(payload);

    await queryClient.invalidateQueries({ queryKey: spaceQueryKeys.notes(spaceId) });
    return response;
  },

  updateNote: async (
    spaceId: string,
    noteId: string,
    payload: { ciphertext: string },
  ): Promise<unknown> => {
    const response = await queryClient.getMutationCache().build(queryClient, {
      mutationFn: async (vars: typeof payload) => {
        const res = await apiClient.patch<{ data: unknown }>(
          SPACES_API_ROUTES.SPACE_NOTE(spaceId, noteId),
          vars,
          { auth: true },
        );
        return res.data;
      }
    }).execute(payload);

    await queryClient.invalidateQueries({ queryKey: spaceQueryKeys.notes(spaceId) });
    return response;
  },

  deleteNote: async (spaceId: string, noteId: string): Promise<unknown> => {
    const response = await queryClient.getMutationCache().build(queryClient, {
      mutationFn: async (vars: { spaceId: string; noteId: string }) => {
        const res = await apiClient.delete<{ data: unknown }>(
          SPACES_API_ROUTES.SPACE_NOTE(vars.spaceId, vars.noteId),
          { auth: true },
        );
        return res.data;
      }
    }).execute({ spaceId, noteId });

    await queryClient.invalidateQueries({ queryKey: spaceQueryKeys.notes(spaceId) });
    return response;
  },
};
