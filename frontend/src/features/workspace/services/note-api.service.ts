import { apiClient } from "@/services/api";
import { WORKSPACE_API_ROUTES } from "@/features/workspace/constants/workspace.constants";
import type { Note, RemoteNote } from "../types/workspace.types";
import { noteService } from "./note.service";
import { db } from "@/features/storage";

export const noteApiService = {
  /**
   * Fetches a single note from remote, decrypts it, and merges into local Dexie.
   * useLiveQuery subscribers pick up the Dexie write automatically.
   */
  getNote: async (id: string): Promise<Note | undefined> => {
    try {
      const response: { data: RemoteNote } = await apiClient.get(
        `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
        { auth: true },
      );

      const decryptedNote = await noteService.decryptNote(response.data);
      if (decryptedNote) {
        await db.notes.put(decryptedNote);
      }
      return decryptedNote ?? undefined;
    } catch {
      return undefined;
    }
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
  }): Promise<void> => {
    await apiClient.post(WORKSPACE_API_ROUTES.NOTES, payload, {
      auth: true,
    });
  },

  updateNote: async (payload: {
    id: string;
    ciphertext: string;
    isFavorite?: boolean;
    parentId?: string | null;
    updatedAt: string;
  }): Promise<RemoteNote> => {
    const res: { data: RemoteNote } = await apiClient.patch(
      `${WORKSPACE_API_ROUTES.NOTES}/${payload.id}`,
      {
        ciphertext: payload.ciphertext,
        updatedAt: payload.updatedAt,
        isFavorite: payload.isFavorite,
        parentId: payload.parentId,
      },
      { auth: true },
    );
    return res.data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`${WORKSPACE_API_ROUTES.NOTES}/${id}`, {
      auth: true,
    });
  },

  restoreNote: async (id: string): Promise<void> => {
    await apiClient.post(
      `${WORKSPACE_API_ROUTES.NOTES}/${id}/restore`,
      {},
      { auth: true },
    );
  },

  permanentDeleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(
      `${WORKSPACE_API_ROUTES.NOTES}/${id}/permanent-delete`,
      { auth: true },
    );
  },
};
