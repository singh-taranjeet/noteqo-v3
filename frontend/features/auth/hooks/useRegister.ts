import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { RegisterRequestPayload, AuthResponse } from "../types/auth.types";
import { KeysService } from "../services/keys.service";

export type RegisterFormData = Omit<
  RegisterRequestPayload,
  "publicKey" | "privateKey"
>;

export interface RegisterResult {
  response: AuthResponse;
  masterKey: string;
}

export const useRegister = () => {
  return useMutation<RegisterResult, Error, RegisterFormData>({
    mutationFn: async (formData: RegisterFormData) => {
      const { masterKey, publicKey, encryptedPrivateKey } =
        await KeysService.generateTempKeys();

      const response = await authService.register({
        ...formData,
        publicKey,
        privateKey: encryptedPrivateKey,
      });

      return {
        response,
        masterKey,
      };
    },
  });
};
