import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { spaceApiService } from "../services/space-api.service";
import { userApiService } from "@/features/auth/services/user-api.service";
import { spaceService } from "../services/space.service";
import { cryptoService, CRYPTO_CONFIG } from "@/features/crypto";
import type { RemoteSpaceMember } from "../types/spaces.types";

export function useSpaceMembers(spaceId: string) {
  return useQuery({
    queryKey: ["spaces", "members", spaceId],
    queryFn: () =>
      spaceApiService.getMembers(spaceId) as Promise<RemoteSpaceMember[]>,
    enabled: !!spaceId,
  });
}

export function useAddSpaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spaceId,
      email,
      role,
    }: {
      spaceId: string;
      email: string;
      role: string;
    }) => {
      // 1. Fetch the user's public key by email using React Query to cache it permanently
      const { publicKey } = await queryClient.fetchQuery({
        queryKey: ["users", "publicKey", email],
        queryFn: () => userApiService.getPublicKeyByEmail(email),
        staleTime: Infinity,
        gcTime: Infinity,
      });

      if (!publicKey) {
        throw new Error("User does not exist or has no public key");
      }

      // 2. Fetch the local spaceKey from Dexie cache
      const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
      if (!spaceKeyBase64) {
        throw new Error("Missing local space key");
      }

      const spaceKeyBuffer = cryptoService.decodeBase64(spaceKeyBase64);
      const spaceKeyBytes = new Uint8Array(spaceKeyBuffer);

      // 3. Import the invitee's public key
      const rsaPublicKey = await globalThis.crypto.subtle.importKey(
        "jwk",
        JSON.parse(publicKey) as JsonWebKey,
        {
          name: CRYPTO_CONFIG.ALGORITHMS.RSA,
          hash: CRYPTO_CONFIG.ALGORITHMS.HASH,
        },
        false,
        ["encrypt"],
      );

      // 4. Encrypt the space key using the invitee's public key
      const encryptedBuffer = await globalThis.crypto.subtle.encrypt(
        { name: CRYPTO_CONFIG.ALGORITHMS.RSA },
        rsaPublicKey,
        spaceKeyBytes as BufferSource,
      );

      const encryptedSpaceKey = cryptoService.encodeBase64(encryptedBuffer);

      // 5. Call API
      return spaceApiService.addMember(spaceId, {
        email,
        encryptedSpaceKey,
        role,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["spaces", "members", variables.spaceId],
      });
    },
  });
}

export function useRemoveSpaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      spaceId,
      userId,
    }: {
      spaceId: string;
      userId: string;
    }) => {
      return spaceApiService.removeMember(spaceId, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["spaces", "members", variables.spaceId],
      });
    },
  });
}
