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
const queryClient = new QueryClient();

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
    const { id, ciphertext, encryptedNoteKey } = payload;
    await apiClient.post(
      WORKSPACE_API_ROUTES.NOTES,
      {
        id,
        ciphertext,
        encryptedNoteKey,
      },
      { auth: true }
    );
    
    // Invalidate the cache after successful mutation
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });
  },

  updateNote: async (payload: {
    id: string;
    ciphertext: string;
    encryptedNoteKey: string;
  }) => {
    const { id, ciphertext, encryptedNoteKey } = payload;
    const response: { data: RemoteNoteResponse } = await apiClient.patch(
      `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
      {
        ciphertext,
        encryptedNoteKey,
      },
      { auth: true }
    );
    
    // Invalidate the relevant caches
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(id) });
    return response.data;
  },

  deleteNote: async (id: string) => {
    const response: any = await apiClient.delete(
      `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
      { auth: true },
    );
    
    // Invalidate the relevant caches
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.lists() });
    await queryClient.invalidateQueries({ queryKey: noteQueryKeys.detail(id) });
    return response.data;
  },
};
