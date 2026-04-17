"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

import { storageService, STORAGE_KEYS } from "@/features/storage";
import type { LoginRequestPayload, AuthResponse } from "../types/auth.types";

export type LoginFormData = LoginRequestPayload;

export interface LoginResult {
  response: AuthResponse;
}

export const useLogin = () => {
  return useMutation<LoginResult, Error, LoginFormData>({
    mutationFn: async (formData: LoginFormData) => {
      // 1. Authenticate with backend
      const response = await authService.login(formData);

      // 2. Store user's keys locally for offline crypto operations
      const { user, accessToken } = response;

      if (user.publicKey) {
        await storageService.put(STORAGE_KEYS.PUBLIC_KEY, user.publicKey);
      }

      // The private key from the server is encrypted.
      // For now we store it as-is; the master key prompt (recovery code)
      // will be needed to decrypt it for document operations.
      if (user.privateKey) {
        await storageService.put(STORAGE_KEYS.PRIVATE_KEY, user.privateKey);
      }

      if (accessToken) {
        await storageService.put(STORAGE_KEYS.JWT_KEY, accessToken);
      }

      return { response };
    },
  });
};
