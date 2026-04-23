"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DynamicForm } from "@/components/ui/DynamicForm";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { AUTH_CONFIG } from "@/features/auth/constants/auth.constants";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { DynamicDialog } from "@/components/ui/DynamicDialog";

import type { LoginFormData } from "@/features/auth/hooks/useLogin";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";
import { KeysService } from "@/features/auth/services/keys.service";

const LOGIN_FIELDS: FormFieldConfig[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "john@example.com",
    autoComplete: "email",
  },
  {
    name: "authCredential",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "••••••••",
    minLength: AUTH_CONFIG.MIN_PASSWORD_LENGTH,
    autoComplete: "current-password",
  },
];

export function LoginForm() {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useLogin();
  const [error, setError] = useState<string | null>(null);

  const [showMasterKeyPrompt, setShowMasterKeyPrompt] = useState(false);

  const redirectNotespage = useCallback(
    function redirectNotesPage() {
      router.push(ROUTES.NOTES);
    },
    [router],
  );

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setError(null);
      try {
        const formData: LoginFormData = {
          email: values.email as string,
          authCredential: values.authCredential as string,
        };
        const { isMasterKeyRequired } = await login(formData);

        if (isMasterKeyRequired) {
          setShowMasterKeyPrompt(true);
        } else {
          // redirect to notes page
          redirectNotespage();
        }

        setShowMasterKeyPrompt(isMasterKeyRequired);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(
            err.message || "Invalid email or password. Please try again.",
          );
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }
    },
    [login, redirectNotespage],
  );

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl bg-card/60 backdrop-blur-xl border-foreground/10">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Log in to access your encrypted documents. Your data stays secure with
          E2E encryption.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicForm
          fields={LOGIN_FIELDS}
          onSubmit={handleSubmit}
          submitLabel="Log In"
          loadingLabel="Authenticating…"
          isLoading={isPending}
          error={error}
          footer={
            <>
              Don&apos;t have an account?{" "}
              <a
                href={ROUTES.REGISTER}
                className="ml-1 text-primary hover:underline underline-offset-4"
              >
                Sign up
              </a>
            </>
          }
        />
      </CardContent>

      <DynamicDialog
        title="Enter Your Master Key"
        description="To unlock your end-to-end encrypted notes on this device, please provide your Master Key (Recovery Code) that was generated when you signed up."
        isOpen={showMasterKeyPrompt}
        onOpenChange={setShowMasterKeyPrompt}
        showCloseButton={false}
      >
        <div className="py-2">
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <DynamicForm
            fields={[
              {
                name: "masterKey",
                label: "Master Key",
                type: "password",
                placeholder: "Paste your 44-character master key here",
                required: true,
                autoComplete: "off",
              },
            ]}
            onSubmit={async (values) => {
              const key = values.masterKey as string;
              if (!key.trim()) return;
              try {
                await KeysService.storeMasterKey({ masterKey: key.trim() });
                redirectNotespage();
              } catch (err) {
                console.log("Error", err);
                setError("Invalid master key provided. Please check it and try again.");
                setShowMasterKeyPrompt(false);
              }
            }}
            submitLabel="Unlock Vault"
          />
        </div>
      </DynamicDialog>
    </Card>
  );
}
