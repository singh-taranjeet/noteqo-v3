"use client";
import { apiClient } from "@/services/api";
import {
  noteQueryKeys,
  WORKSPACE_API_ROUTES,
} from "../constants/workspace.constants";
import type { Note, RemoteNote } from "../types/workspace.types";
import { noteService } from "./note.service";
import { getQueryClient } from "@/components/Providers/Providers";
import { NoteLocalService } from "./note-local.service";

export const noteApiService = {
  client: () => {
    const queryClient = getQueryClient();
    return queryClient;
  },
  getNote: async (id: string): Promise<Note> => {
    return noteApiService.client().fetchQuery({
      queryKey: noteQueryKeys.remoteNoteId(id),
      queryFn: async () => {
        const response: { data: RemoteNote } = await apiClient.get(
          `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
          { auth: true },
        );

        const decryptedNote = await noteService.decryptNote(response.data);
        if (decryptedNote) {
          await NoteLocalService.updateNote(decryptedNote.id, decryptedNote);
        }
        // Invalidate queries
        noteApiService.client().invalidateQueries({
          queryKey: noteQueryKeys.localNoteId(id),
        });
        return decryptedNote ?? undefined;
      },
      staleTime: 10 * 60 * 1000,
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
    await noteApiService
      .client()
      .getMutationCache()
      .build(noteApiService.client(), {
        mutationFn: async (vars: typeof payload) => {
          await apiClient.post(WORKSPACE_API_ROUTES.NOTES, vars, {
            auth: true,
          });
        },
      })
      .execute(payload);
  },

  updateNote: async (payload: {
    id: string;
    ciphertext: string;
    isFavorite?: boolean;
    parentId?: string | null;
    updatedAt: string;
  }) => {
    const response = await noteApiService
      .client()
      .getMutationCache()
      .build(noteApiService.client(), {
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
    const response = await noteApiService
      .client()
      .getMutationCache()
      .build(noteApiService.client(), {
        mutationFn: async (noteId: string) => {
          const res: { data: unknown } = await apiClient.delete(
            `${WORKSPACE_API_ROUTES.NOTES}/${noteId}`,
            { auth: true },
          );
          return res.data;
        },
      })
      .execute(id);

    await noteApiService.client().invalidateQueries({
      queryKey: noteQueryKeys.localNoteId(id),
    });
    await noteApiService.client().invalidateQueries({
      queryKey: noteQueryKeys.remoteNoteId(id),
    });
    return response;
  },

  restoreNote: async (id: string) => {
    const response = await noteApiService
      .client()
      .getMutationCache()
      .build(noteApiService.client(), {
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

    await noteApiService.client().invalidateQueries({
      queryKey: noteQueryKeys.localNoteId(id),
    });
    await noteApiService.client().invalidateQueries({
      queryKey: noteQueryKeys.remoteNoteId(id),
    });
    return response;
  },

  permanentDeleteNote: async (id: string) => {
    const response = await noteApiService
      .client()
      .getMutationCache()
      .build(noteApiService.client(), {
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
    await noteApiService.client().invalidateQueries({
      queryKey: noteQueryKeys.remoteNoteId(id),
    });
    await noteApiService.client().invalidateQueries({
      queryKey: noteQueryKeys.localNoteId(id),
    });
    return response;
  },
};
