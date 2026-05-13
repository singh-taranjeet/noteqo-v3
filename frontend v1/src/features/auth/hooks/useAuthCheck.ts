
import { useState, useEffect } from "react";
import { storageService, STORAGE_KEYS } from "@/features/storage";

/**
 * Checks if the user has local auth keys (public key) stored in IndexedDB.
 * Returns `{ isAuthenticated, isLoading }`.
 *
 * Since auth state lives in IndexedDB (client-only, async), this hook
 * resolves asynchronously after mount.
 */
export const useAuthCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const publicKey = await storageService.get<string>(
          STORAGE_KEYS.PUBLIC_KEY,
        );
        if (!cancelled) {
          setIsAuthenticated(!!publicKey);
        }
      } catch {
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAuthenticated, isLoading };
};
