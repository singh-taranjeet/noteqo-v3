import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthCheck } from "@/features/auth/hooks/useAuthCheck";
import { ROUTES } from "@/constants/routes";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: Readonly<AuthGuardProps>) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthCheck();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    // Will redirect via the effect above — render nothing to avoid flash
    return null;
  }

  return <>{children}</>;
}
