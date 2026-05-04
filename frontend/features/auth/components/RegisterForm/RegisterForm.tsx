"use client";

import { useState, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { RecoveryCodeDialog } from "../RecoveryCodeDialog";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { AUTH_CONFIG } from "@/features/auth/constants/auth.constants";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeysService } from "@/features/auth/services/keys.service";
import { spaceService } from "@/features/spaces/services/space.service";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function RegisterForm() {
  const { logout } = useLogout();
  const router = useRouter();
  const { mutateAsync: register, isPending } = useRegister();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    logout(false, false);
  }, [logout]);

  const [generatedMasterKey, setGeneratedMasterKey] = useState<string | null>(
    null,
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        const result = await register({
          name,
          email,
          authCredential: password,
        });

        // 1. Store keys and access token locally
        await KeysService.store({
          accessToken: result.response.data.accessToken,
          publicKey: result.response.data.user.publicKey,
          privateKey: result.response.data.user.privateKey,
          masterKey: result.masterKey,
        });

        // 2. Store user profile
        const { storageService, STORAGE_KEYS } =
          await import("@/features/storage");
        await storageService.put(
          STORAGE_KEYS.USER_PROFILE,
          result.response.data.user,
        );

        // 3. Create default personal space
        await spaceService.createSpace();

        // 4. Show recovery code dialog
        setGeneratedMasterKey(result.masterKey);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Registration failed. Please try again.");
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    },
    [register, name, email, password],
  );

  const handleDialogClose = useCallback(() => {
    // Acknowledged, we can seamlessly push to dashboard
    router.push(ROUTES.NOTES);
  }, [router]);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign up to securely encrypt and sync your documents across all
          devices. We use E2E encryption.
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                autoComplete="name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  minLength={AUTH_CONFIG.MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Secure Account
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="underline underline-offset-4 hover:text-primary"
          >
            Log in
          </Link>
        </div>
      </div>

      {generatedMasterKey && (
        <RecoveryCodeDialog
          isOpen={!!generatedMasterKey}
          masterKey={generatedMasterKey}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
}
