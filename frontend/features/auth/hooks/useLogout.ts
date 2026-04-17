'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { storageService, db } from '@/features/storage';
import { ROUTES } from '@/constants/routes';

/**
 * Hook that handles full client-side logout:
 * 1. Clears all keys (master key, public/private keys)
 * 2. Clears local document & sync queue tables
 * 3. Resets React Query cache
 * 4. Redirects to the register page (login page not yet built)
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    // 1. Clear all IndexedDB tables
    await Promise.all([
      storageService.clear(),
      db.documents.clear(),
      db.syncQueue.clear(),
    ]);

    // 2. Clear React Query cache
    queryClient.clear();

    // 3. Redirect to auth page
    router.replace(ROUTES.LOGIN);
  }, [router, queryClient]);

  return { logout };
};
