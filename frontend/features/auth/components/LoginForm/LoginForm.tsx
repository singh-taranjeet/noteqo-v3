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
import { useLogin } from "../../hooks/useLogin";
import { AUTH_CONFIG } from "../../constants/auth.constants";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

import type { LoginFormData } from "../../hooks/useLogin";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";

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

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setError(null);
      try {
        const formData: LoginFormData = {
          email: values.email as string,
          authCredential: values.authCredential as string,
        };
        await login(formData);
        router.push(ROUTES.NOTES);
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
    [login, router],
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
    </Card>
  );
}
