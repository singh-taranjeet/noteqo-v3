
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { LoginRequestPayload } from "../types/auth.types";
import { KeysService } from "../services/keys.service";

export type LoginFormData = LoginRequestPayload;

export interface LoginResult {
  isMasterKeyRequired: boolean;
}

export const useLogin = () => {
  return useMutation<LoginResult, Error, LoginFormData>({
    mutationFn: async (formData: LoginFormData) => {
      // 1. Authenticate with backend
      const response = await authService.login(formData);

      // 2. Store user's keys locally for offline crypto operations
      const { user, accessToken } = response.data;

      const masterKey = await KeysService.isMasterInLocalStorage(
        user.publicKey,
      );

      KeysService.store({
        publicKey: user.publicKey,
        privateKey: user.privateKey,
        accessToken,
        masterKey: typeof masterKey === "string" ? masterKey : undefined,
      });

      // 3. Store user profile
      const { storageService, STORAGE_KEYS } =
        await import("@/features/storage");
      await storageService.put(STORAGE_KEYS.USER_PROFILE, user);

      const isMasterKeyRequired = typeof masterKey !== "string";

      return { isMasterKeyRequired };
    },
  });
};
