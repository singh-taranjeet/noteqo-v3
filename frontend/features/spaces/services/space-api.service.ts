import { apiClient } from "@/services/api";
import { SPACES_API_ROUTES } from "../constants/spaces.constants";
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

export const spaceApiService = {
  getAll: (): Promise<RemoteSpace[]> =>
    apiClient.get<RemoteSpace[]>(SPACES_API_ROUTES.SPACES, { auth: true }),

  create: (payload: CreateSpacePayload): Promise<RemoteSpace> =>
    apiClient.post<RemoteSpace>(SPACES_API_ROUTES.SPACES, payload, {
      auth: true,
    }),

  getNotes: (spaceId: string): Promise<SpaceNotesResponse> =>
    apiClient.get<SpaceNotesResponse>(SPACES_API_ROUTES.SPACE_NOTES(spaceId), {
      auth: true,
    }),

  createNote: (
    spaceId: string,
    payload: CreateSpaceNotePayload,
  ): Promise<unknown> =>
    apiClient.post(SPACES_API_ROUTES.SPACE_NOTES(spaceId), payload, {
      auth: true,
    }),

  updateNote: (
    spaceId: string,
    noteId: string,
    payload: { ciphertext: string },
  ): Promise<unknown> =>
    apiClient.patch(
      SPACES_API_ROUTES.SPACE_NOTE(spaceId, noteId),
      payload,
      { auth: true },
    ),

  deleteNote: (spaceId: string, noteId: string): Promise<unknown> =>
    apiClient.delete(SPACES_API_ROUTES.SPACE_NOTE(spaceId, noteId), {
      auth: true,
    }),
};
