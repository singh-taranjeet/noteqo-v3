import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { cryptoService } from '@/features/crypto';
import { storageService, STORAGE_KEYS } from '@/features/storage';
import type { RegisterRequestPayload, AuthResponse } from '../types/auth.types';

export type RegisterFormData = Omit<RegisterRequestPayload, 'publicKey' | 'privateKey'>;

export interface RegisterResult {
  response: AuthResponse;
  masterKey: string;
}

export const useRegister = () => {
  return useMutation<RegisterResult, Error, RegisterFormData>({
    mutationFn: async (formData: RegisterFormData) => {
      // 1. Generate Master Key (Encryption Key / Recovery Code)
      const masterKey = cryptoService.generateMasterKey();

      // 2. Generate RSA Key Pair
      const { publicKey, privateKey } = await cryptoService.generateKeyPair();

      // 3. Encrypt the Private Key with the Master Key
      const encryptedPrivateKey = await cryptoService.encryptPrivateKey(privateKey, masterKey);

      // 4. Send to Backend
      const response = await authService.register({
        ...formData,
        publicKey,
        privateKey: encryptedPrivateKey,
      });

      // 5. Store Keys Locally for Seamless Redirection
      await Promise.all([
        storageService.put(STORAGE_KEYS.MASTER_KEY, masterKey),
        storageService.put(STORAGE_KEYS.PUBLIC_KEY, publicKey),
        storageService.put(STORAGE_KEYS.PRIVATE_KEY, privateKey), // Store UNENCRYPTED locally
      ]);

      return {
        response,
        masterKey,
      };
    },
  });
};
