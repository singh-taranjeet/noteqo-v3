"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/constants/routes";
import { KeysService } from "../services/keys.service";
import { LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED } from "@/features/spaces";

/**
 * Hook that handles full client-side logout:
 * 1. Clears keys (master key if chosen, public/private keys)
 * 2. Clears local note & sync queue tables
 * 3. Resets React Query cache
 * 4. Redirects to the login page
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useCallback(
    async (deleteMasterKey: boolean = true) => {
      await KeysService.clear(deleteMasterKey);

      // 2. Clear React Query cache
      queryClient.clear();

      // Clear the inti localstorage option as well
      localStorage.removeItem(LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED);

      // 3. Redirect to auth page
      router.replace(ROUTES.LOGIN);
    },
    [router, queryClient],
  );

  return { logout };
};
