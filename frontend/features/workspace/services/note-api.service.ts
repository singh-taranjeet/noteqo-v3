import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { SYNC_CONFIG, WORKSPACE_API_ROUTES } from "../constants/workspace.constants";

export interface RemoteNoteResponse {
  id: string;
  ciphertext: string;
  encryptedNoteKey: string;
  createdAt: string;
  updatedAt: string;
  keySlots?: { userId: string; encryptedNoteKey: string }[];
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

export const noteQueryKeys = {
  all: ["notes"] as const,
  lists: () => [...noteQueryKeys.all, "list"] as const,
  detail: (id: string) => [...noteQueryKeys.all, "detail", id] as const,
};

export const noteApiService = {
  getAllNotes: (): Promise<{ data: RemoteNoteResponse[] }> => {
    return queryClient.fetchQuery({
      queryKey: noteQueryKeys.lists(),
      queryFn: async () => {
        const response: { data: RemoteNoteResponse[] } = await apiClient.get(
          WORKSPACE_API_ROUTES.NOTES,
          { auth: true }
        );
        return response;
      },
      staleTime: SYNC_CONFIG.CACHE_STALE_TIME_MS,
    });
  },

  getNote: async (id: string): Promise<RemoteNoteResponse> => {
    return queryClient.fetchQuery({
      queryKey: noteQueryKeys.detail(id),
      queryFn: async () => {
        const response: { data: RemoteNoteResponse } = await apiClient.get(
          `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
          { auth: true }
        );
        return response.data;
      },
      staleTime: SYNC_CONFIG.CACHE_STALE_TIME_MS,
    });
  },

  createNote: async (payload: {
    id: string;
    ciphertext: string;
    encryptedNoteKey: string;
  }) => {
    // Utilize React Query's execution layer directly to activate mutation retries
    await queryClient.getMutationCache().build(queryClient, {
      mutationFn: async (vars: typeof payload) => {
        const { id, ciphertext, encryptedNoteKey } = vars;
        await apiClient.post(
          WORKSPACE_API_ROUTES.NOTES,
          { id, ciphertext, encryptedNoteKey },
          { auth: true }
        );
      }
    }).execute(payload);
    
    // Invalidate the cache after successful mutation
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });
  },

  updateNote: async (payload: {
    id: string;
    ciphertext: string;
    encryptedNoteKey: string;
  }) => {
    const response = await queryClient.getMutationCache().build(queryClient, {
      mutationFn: async (vars: typeof payload) => {
        const { id, ciphertext, encryptedNoteKey } = vars;
        const res: { data: RemoteNoteResponse } = await apiClient.patch(
          `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
          { ciphertext, encryptedNoteKey },
          { auth: true }
        );
        return res.data;
      }
    }).execute(payload);
    
    // Invalidate the relevant caches
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(payload.id) });
    return response as RemoteNoteResponse;
  },

  deleteNote: async (id: string) => {
    const response = await queryClient.getMutationCache().build(queryClient, {
      mutationFn: async (noteId: string) => {
        const res: { data: unknown } = await apiClient.delete(
          `${WORKSPACE_API_ROUTES.NOTES}/${noteId}`,
          { auth: true },
        );
        return res.data;
      }
    }).execute(id);
    
    // Invalidate the relevant caches
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(id) });
    return response;
  },
};
