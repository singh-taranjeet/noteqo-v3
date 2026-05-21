import { apiClient } from "@/services/api.service";
import { USER_API_ROUTES } from "../constants/auth.constants";

export const userApiService = {
  getPublicKeyByEmail: async (
    email: string,
  ): Promise<{ publicKey: string }> => {
    const res = await apiClient.get<{ data: { publicKey: string } }>(
      `${USER_API_ROUTES.PUBLIC_KEY}?email=${encodeURIComponent(email)}`,
      { auth: true },
    );
    return res.data;
  },
};
