import { apiClient } from "@/services/api";
import { WORKSPACE_API_ROUTES } from "../constants/workspace.constants";

export interface RemoteNoteResponse {
  id: string;
  ciphertext: string;
  encryptedDocKey: string;
  createdAt: string;
  updatedAt: string;
  keySlots?: { userId: string; encryptedDocKey: string }[];
}

export const noteApiService = {
  getAllNotes: (): Promise<{ data: RemoteNoteResponse[] }> =>
    apiClient.get(WORKSPACE_API_ROUTES.NOTES, { auth: true }),
};
