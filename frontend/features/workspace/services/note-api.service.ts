import { apiClient } from "@/services/api";
import { WORKSPACE_API_ROUTES } from "../constants/workspace.constants";

export interface RemoteNoteResponse {
  id: string;
  ciphertext: string;
  encryptedNoteKey: string;
  createdAt: string;
  updatedAt: string;
  keySlots?: { userId: string; encryptedNoteKey: string }[];
}

export const noteApiService = {
  getAllNotes: (): Promise<{ data: RemoteNoteResponse[] }> =>
    apiClient.get(WORKSPACE_API_ROUTES.NOTES, { auth: true }),

  getNote: async (id: string): Promise<RemoteNoteResponse> => {
    const response : {
      data: RemoteNoteResponse
    } = await apiClient.get(`${WORKSPACE_API_ROUTES.NOTES}/${id}`, { auth: true });
    return (response.data) as RemoteNoteResponse;
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
          { auth: true },
        );
  },
  updateNote: async (payload: {
    id: string;
    ciphertext: string;
    encryptedNoteKey: string;

  }) => {
    const { id, ciphertext, encryptedNoteKey } = payload;
    const response : {
      data: RemoteNoteResponse
    } = await apiClient.patch(
          `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
          {
            ciphertext,
            encryptedNoteKey,
          },
          { auth: true },
        );
    return response.data;
  },
  deleteNote: async (id: string) => {
    const response: any = await apiClient.delete(
          `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
          { auth: true },
        );
    return response.data;
  }
};
