"use client";
import { apiClient } from "@/services/api";
import {
  noteQueryKeys,
  SYNC_CONFIG,
  WORKSPACE_API_ROUTES,
} from "../constants/workspace.constants";
import type { Note, RemoteNote } from "../types/workspace.types";
import { noteService } from "./note.service";
import { db } from "@/features/storage";
import { getQueryClient } from "@/components/Providers/Providers";

// Create a local query client instance for caching API responses natively
// inside the service layer, maintaining compatibility with existing consumers.
const queryClient = getQueryClient();

export const noteApiService = {
  getNote: async (id: string): Promise<Note> => {
    return queryClient.fetchQuery({
      queryKey: noteQueryKeys.remoteNoteId(id),
      queryFn: async () => {
        const response: { data: RemoteNote } = await apiClient.get(
          `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
          { auth: true },
        );

        const decryptedNote = await noteService.decryptNote(response.data);
        if (decryptedNote) {
          await db.notes.put(decryptedNote);
          // Invalidate queries
          queryClient.invalidateQueries({
            queryKey: noteQueryKeys.localNoteId(id),
          });
          queryClient.invalidateQueries({
            queryKey: noteQueryKeys.remoteNoteId(id),
          });
        }
        return decryptedNote ?? undefined;
      },
      staleTime: SYNC_CONFIG.CACHE_STALE_TIME_MS,
    });
  },

  createNote: async (payload: {
    id: string;
    ciphertext: string;
    spaceId: string;
    type: string;
    isFavorite?: boolean;
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
  }) => {
    await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: typeof payload) => {
          await apiClient.post(WORKSPACE_API_ROUTES.NOTES, vars, {
            auth: true,
          });
        },
      })
      .execute(payload);

    // TODO: We need to invalidate the space and notes query
  },

  updateNote: async (payload: {
    id: string;
    ciphertext: string;
    isFavorite?: boolean;
    parentId?: string | null;
    updatedAt: string;
  }) => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (vars: typeof payload) => {
          const res: { data: RemoteNote } = await apiClient.patch(
            `${WORKSPACE_API_ROUTES.NOTES}/${vars.id}`,
            {
              ciphertext: vars.ciphertext,
              updatedAt: vars.updatedAt,
              isFavorite: vars.isFavorite,
              parentId: vars.parentId,
            },
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(payload);

    // TODO: We need to invalidate the space and notes query
    await queryClient.invalidateQueries({
      queryKey: noteQueryKeys.localNoteId(payload.id),
    });

    await queryClient.invalidateQueries({
      queryKey: noteQueryKeys.remoteNoteId(payload.id),
    });

    return response as RemoteNote;
  },

  deleteNote: async (id: string) => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (noteId: string) => {
          const res: { data: unknown } = await apiClient.delete(
            `${WORKSPACE_API_ROUTES.NOTES}/${noteId}`,
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(id);

    // TODO: We need to invalidate the space and notes query
    await queryClient.invalidateQueries({
      queryKey: noteQueryKeys.remoteNoteId(id),
    });
    return response;
  },

  restoreNote: async (id: string) => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (noteId: string) => {
          const res: { data: unknown } = await apiClient.post(
            `${WORKSPACE_API_ROUTES.NOTES}/${noteId}/restore`,
            {},
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(id);

    // TODO: We need to invalidate the space and notes query
    await queryClient.invalidateQueries({
      queryKey: noteQueryKeys.remoteNoteId(id),
    });
    return response;
  },

  permanentDeleteNote: async (id: string) => {
    const response = await queryClient
      .getMutationCache()
      .build(queryClient, {
        mutationFn: async (noteId: string) => {
          const res: { data: unknown } = await apiClient.delete(
            `${WORKSPACE_API_ROUTES.NOTES}/${noteId}/permanent-delete`,
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(id);

    // TODO: We need to invalidate the space and notes query
    await queryClient.invalidateQueries({
      queryKey: noteQueryKeys.remoteNoteId(id),
    });
    return response;
  },
};
