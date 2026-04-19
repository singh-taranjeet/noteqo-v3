"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthCheck } from "../../hooks/useAuthCheck";
import { ROUTES } from "@/constants/routes";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Client-side auth guard that redirects unauthenticated users to the login page.
 * Renders a loading spinner while the async IndexedDB check is in progress,
 * then either renders children or redirects.
 */
export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthCheck();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Will redirect via the effect above — render nothing to avoid flash
    return null;
  }

  return <>{children}</>;
}
