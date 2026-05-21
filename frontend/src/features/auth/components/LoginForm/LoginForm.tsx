import { useState, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useLogin } from "../../hooks/useLogin";
import { AUTH_CONFIG, AUTH_MESSAGES } from "../../constants/auth.constants";
import { ROUTES } from "@/constants/routes.constants";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { KeysService } from "../../services/keys.service";
import { logService } from "@/services";
import { useLogout } from "../../hooks/useLogout";

export function LoginForm() {
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { mutateAsync: login, isPending } = useLogin();
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showMasterKeyPrompt, setShowMasterKeyPrompt] = useState(false);
  const [masterKey, setMasterKey] = useState("");

  useEffect(() => {
    logout(false, false);
  }, [logout]);

  const redirectNotespage = useCallback(
    function redirectNotesPage() {
      navigate(ROUTES.NOTES);
    },
    [navigate],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      try {
        const { isMasterKeyRequired } = await login({
          email,
          authCredential: password,
        });

        if (isMasterKeyRequired) {
          setShowMasterKeyPrompt(true);
        } else {
          redirectNotespage();
        }

        setShowMasterKeyPrompt(isMasterKeyRequired);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || AUTH_MESSAGES.INVALID_CREDENTIALS);
        } else {
          setError(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }
      }
    },
    [login, redirectNotespage, email, password],
  );

  const handleMasterKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKey.trim()) return;
    try {
      await KeysService.storeMasterKey({ masterKey: masterKey.trim() });
      redirectNotespage();
    } catch (err) {
      logService.error("Error", err);
      setError(AUTH_MESSAGES.INVALID_MASTER_KEY);
      setShowMasterKeyPrompt(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Log in to access your securely encrypted documents.
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
                  autoComplete="current-password"
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
              Log In
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to={ROUTES.REGISTER}
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up
          </Link>
        </div>
      </div>

      <DynamicDialog
        title="Enter Your Master Key"
        description="To unlock your end-to-end encrypted notes on this device, please provide your Master Key (Recovery Code) that was generated when you signed up."
        isOpen={showMasterKeyPrompt}
        onOpenChange={setShowMasterKeyPrompt}
        showCloseButton={false}
      >
        <div className="py-2">
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <form onSubmit={handleMasterKeySubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="masterKey">Master Key</Label>
              <Input
                id="masterKey"
                type="password"
                placeholder="Paste your 44-character master key here"
                required
                autoComplete="off"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Unlock Vault
            </Button>
          </form>
        </div>
      </DynamicDialog>
    </>
  );
}
