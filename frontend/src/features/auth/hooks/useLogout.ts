import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/constants/routes.constants";
import { KeysService } from "../services/keys.service";
import { SpaceLocalStorageService } from "@/features/spaces";

/**
 * Hook that handles full client-side logout:
 * 1. Clears keys (master key if chosen, public/private keys)
 * 2. Clears local note & sync queue tables
 * 3. Resets React Query cache
 * 4. Redirects to the login page
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = useCallback(
    async (deleteMasterKey: boolean = true, autoRedirect = true) => {
      await KeysService.clear(deleteMasterKey);

      // 2. Clear React Query cache
      queryClient.clear();

      // Clear the inti localstorage option as well
      SpaceLocalStorageService.resetFetched();

      if (autoRedirect) {
        // 3. Redirect to auth page
        navigate(ROUTES.LOGIN);
      }
    },
    [navigate, queryClient],
  );

  return { logout };
};
