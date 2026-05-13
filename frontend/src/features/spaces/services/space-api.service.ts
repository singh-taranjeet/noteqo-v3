import { apiClient } from "@/services/api";
import { SPACES_API_ROUTES } from "../constants/spaces.constants";
import { SYNC_CONFIG } from "../../workspace/constants/workspace.constants";
import type {
  RemoteSpace,
  RemoteSpaceMember,
  SpaceNotesResponse,
  SpaceType,
} from "../types/spaces.types";
import { getQueryClient } from "@/components/Providers/Providers";
import { QueryKeys } from "@/features/shared/constants/index.shared.constants";

export interface CreateSpacePayload {
  id: string;
  encryptedName: string; // base64
  type: SpaceType;
  ownerKeySlot: string; // base64 — RSA(spaceKey, ownerPublicKey)
  updatedAt: string;
  createdAt: string;
}

export interface CreateSpaceNotePayload {
  id: string;
  ciphertext: string; // base64
  spaceId: string;
  type: string; // 'private' | 'shared'
  updatedAt: string;
  createdAt: string;
}

export const spaceApiService = {
  client: () => {
    const queryClient = getQueryClient();
    return queryClient;
  },

  getAll: async (): Promise<RemoteSpace[]> => {
    return spaceApiService.client().fetchQuery({
      queryKey: QueryKeys.space.remote.all,
      queryFn: async () => {
        const res = await apiClient.get<{ data: RemoteSpace[] }>(
          SPACES_API_ROUTES.SPACES,
          { auth: true },
        );

        return res.data;
      },
    });
  },

  getRecentlyUpdated: async (): Promise<RemoteSpace[]> => {
    return spaceApiService.client().fetchQuery({
      queryKey: QueryKeys.space.remote.allRecentlyUpdated,
      queryFn: async () => {
        const res = await apiClient.get<{ data: RemoteSpace[] }>(
          SPACES_API_ROUTES.ALL_RECENTLY_UPDATED_NOTES,
          { auth: true },
        );
        return res.data;
      },
      staleTime: 0,
    });
  },

  create: async (payload: CreateSpacePayload): Promise<RemoteSpace> => {
    const response = await spaceApiService
      .client()
      .getMutationCache()
      .build(spaceApiService.client(), {
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

    spaceApiService.client().invalidateQueries({
      queryKey: [
        QueryKeys.space.remote.all,
        QueryKeys.space.remote.allRecentlyUpdated,
      ],
    });

    return response as RemoteSpace;
  },

  update: async (
    spaceId: string,
    payload: { encryptedName: string; updatedAt: string },
  ): Promise<void> => {
    await apiClient.patch(`${SPACES_API_ROUTES.SPACES}/${spaceId}`, payload, {
      auth: true,
    });
  },

  deleteSpace: async (spaceId: string): Promise<void> => {
    await apiClient.delete(`${SPACES_API_ROUTES.SPACES}/${spaceId}`, {
      auth: true,
    });
  },

  getNotes: async (spaceId: string): Promise<SpaceNotesResponse> => {
    return spaceApiService.client().fetchQuery({
      queryKey: QueryKeys.space.remote.notes(spaceId),
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

  getMembers: async (spaceId: string): Promise<RemoteSpaceMember[]> => {
    return spaceApiService.client().fetchQuery({
      queryKey: QueryKeys.space.remote.members(spaceId),
      queryFn: async () => {
        const res = await apiClient.get<{ data: RemoteSpaceMember[] }>(
          SPACES_API_ROUTES.MEMBERS(spaceId),
          { auth: true },
        );
        return res.data;
      },
      staleTime: 10 * 60 * 1000,
    });
  },

  addMember: async (
    spaceId: string,
    payload: { email: string; encryptedSpaceKey: string; role: string },
  ): Promise<void> => {
    const response = await spaceApiService
      .client()
      .getMutationCache()
      .build(spaceApiService.client(), {
        mutationFn: async (vars: typeof payload) => {
          await apiClient.post(SPACES_API_ROUTES.MEMBERS(spaceId), vars, {
            auth: true,
          });
        },
      })
      .execute(payload);

    await spaceApiService.client().invalidateQueries({
      queryKey: QueryKeys.space.remote.members(spaceId),
    });
    return response;
  },

  removeMember: async (spaceId: string, userId: string): Promise<void> => {
    const response = await spaceApiService
      .client()
      .getMutationCache()
      .build(spaceApiService.client(), {
        mutationFn: async (vars: { spaceId: string; userId: string }) => {
          await apiClient.delete(
            SPACES_API_ROUTES.MEMBER(vars.spaceId, vars.userId),
            { auth: true },
          );
        },
      })
      .execute({ spaceId, userId });

    await spaceApiService.client().invalidateQueries({
      queryKey: [
        QueryKeys.space.remote.members(spaceId),
        QueryKeys.space.remote.members,
      ],
    });
    return response;
  },
};
