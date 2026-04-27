import { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { SPACES_API_ROUTES } from "../constants/spaces.constants";
import { SYNC_CONFIG } from "../../workspace/constants/workspace.constants";
import type {
  RemoteSpace,
  RemoteSpaceMember,
  SpaceNotesResponse,
  SpaceType,
} from "../types/spaces.types";

export interface CreateSpacePayload {
  id: string;
  encryptedName: string; // base64
  type: SpaceType;
  ownerKeySlot: string; // base64 — RSA(spaceKey, ownerPublicKey)
  updatedAt: Date;
  createdAt: Date;
}

export interface CreateSpaceNotePayload {
  id: string;
  ciphertext: string; // base64
  spaceId: string;
  type: string; // 'private' | 'shared'
  updatedAt: Date;
  createdAt: Date;
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
  notes: (spaceId: string) =>
    [...spaceQueryKeys.detail(spaceId), "notes"] as const,
  members: (spaceId: string) =>
    [...spaceQueryKeys.detail(spaceId), "members"] as const,
};

export const spaceApiService = {
  /**
   * This fetches all the spaces this user is assigned to.
   * @returns Resolves to an array of remote spaces
   */
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

  /**
   * This creates a new space.
   * @param payload - The payload for creating a new space
   * @returns Resolves to the created remote space
   */
  create: async (payload: CreateSpacePayload): Promise<RemoteSpace> => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: typeof payload) => {
          const res = await apiClient.post<{ data: RemoteSpace }>(
            SPACES_API_ROUTES.SPACES,
            vars,
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(payload);

    await queryClient.invalidateQueries({ queryKey: spaceQueryKeys.lists() });
    return response as RemoteSpace;
  },

  /**
   * This fetches all notes belonging to a particular space
   * @param spaceId - The ID of the space
   * @returns Resolves to an array of remote notes in the specified space
   */
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

  /**
   * This creates a new note in a particular space
   * @param spaceId - The ID of the space
   * @param payload - The payload for creating a new note
   * @returns Resolves to the created note
   */
  createNote: async (
    spaceId: string,
    payload: CreateSpaceNotePayload,
  ): Promise<unknown> => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: typeof payload) => {
          const res = await apiClient.post<{ data: unknown }>(
            SPACES_API_ROUTES.SPACE_NOTES(spaceId),
            vars,
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(payload);

    await queryClient.invalidateQueries({
      queryKey: spaceQueryKeys.notes(spaceId),
    });
    return response;
  },

  /**
   * This updates a note in a particular space
   * @param spaceId - The ID of the space
   * @param noteId - The ID of the note
   * @param payload - The payload for updating the note
   * @returns Resolves to the updated note
   */
  updateNote: async (
    spaceId: string,
    noteId: string,
    payload: { ciphertext: string },
  ): Promise<unknown> => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: typeof payload) => {
          const res = await apiClient.patch<{ data: unknown }>(
            SPACES_API_ROUTES.SPACE_NOTE(spaceId, noteId),
            vars,
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(payload);

    await queryClient.invalidateQueries({
      queryKey: spaceQueryKeys.notes(spaceId),
    });
    return response;
  },

  /**
   * This deletes a note from a particular space
   * @param spaceId - The ID of the space
   * @param noteId - The ID of the note
   * @returns Resolves to the deleted note
   */
  deleteNote: async (spaceId: string, noteId: string): Promise<unknown> => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: { spaceId: string; noteId: string }) => {
          const res = await apiClient.delete<{ data: unknown }>(
            SPACES_API_ROUTES.SPACE_NOTE(vars.spaceId, vars.noteId),
            { auth: true },
          );
          return res.data;
        },
      })
      .execute({ spaceId, noteId });

    await queryClient.invalidateQueries({
      queryKey: spaceQueryKeys.notes(spaceId),
    });
    return response;
  },

  /**
   * This fetches all members of a particular space
   * @param spaceId - The ID of the space
   * @returns Resolves to an array of remote space members
   */
  getMembers: async (spaceId: string): Promise<RemoteSpaceMember[]> => {
    return queryClient.fetchQuery({
      queryKey: spaceQueryKeys.members(spaceId),
      queryFn: async () => {
        const res = await apiClient.get<{ data: RemoteSpaceMember[] }>(
          SPACES_API_ROUTES.MEMBERS(spaceId),
          { auth: true },
        );
        return res.data;
      },
      staleTime: SYNC_CONFIG.CACHE_STALE_TIME_MS,
    });
  },

  /**
   * This adds a new member to a particular space
   * @param spaceId - The ID of the space
   * @param payload - The payload for adding a new member
   * @returns Resolves to void
   */
  addMember: async (
    spaceId: string,
    payload: { email: string; encryptedSpaceKey: string; role: string },
  ): Promise<void> => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: typeof payload) => {
          await apiClient.post(SPACES_API_ROUTES.MEMBERS(spaceId), vars, {
            auth: true,
          });
        },
      })
      .execute(payload);

    await queryClient.invalidateQueries({
      queryKey: spaceQueryKeys.members(spaceId),
    });
    return response;
  },

  /**
   * This removes a member from a particular space
   * @param spaceId - The ID of the space
   * @param userId - The ID of the member to remove
   * @returns Resolves to void
   */
  removeMember: async (spaceId: string, userId: string): Promise<void> => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: { spaceId: string; userId: string }) => {
          await apiClient.delete(
            SPACES_API_ROUTES.MEMBER(vars.spaceId, vars.userId),
            { auth: true },
          );
        },
      })
      .execute({ spaceId, userId });

    await queryClient.invalidateQueries({
      queryKey: spaceQueryKeys.members(spaceId),
    });
    return response;
  },
};
