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
import { RecoveryCodeDialog } from "../RecoveryCodeDialog";
import { useRegister } from "../../hooks/useRegister";
import { AUTH_CONFIG } from "../../constants/auth.constants";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

import type { RegisterFormData } from "../../hooks/useRegister";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";

const REGISTER_FIELDS: FormFieldConfig[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "John Doe",
    autoComplete: "name",
  },
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
    autoComplete: "new-password",
  },
];

export function RegisterForm() {
  const router = useRouter();
  const { mutateAsync: register, isPending } = useRegister();
  const [error, setError] = useState<string | null>(null);
  const [generatedMasterKey, setGeneratedMasterKey] = useState<string | null>(
    null,
  );

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setError(null);
      try {
        const formData: RegisterFormData = {
          name: values.name as string,
          email: values.email as string,
          authCredential: values.authCredential as string,
        };
        const result = await register(formData);
        // Registration successful, keys generated, we now have the master key.
        setGeneratedMasterKey(result.masterKey);
        // set master key in local storage
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Registration failed. Please try again.");
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    },
    [register],
  );

  const handleDialogClose = useCallback(() => {
    // Acknowledged, we can seamlessly push to login or dashboard
    router.push(ROUTES.LOGIN);
  }, [router]);

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-2xl bg-card/60 backdrop-blur-xl border-foreground/10">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign up to securely encrypt and sync your documents across all
            devices. We use E2E encryption, meaning your keys are generated
            locally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm
            fields={REGISTER_FIELDS}
            onSubmit={handleSubmit}
            submitLabel="Create Secure Account"
            loadingLabel="Generating Keys…"
            isLoading={isPending}
            error={error}
            footer={
              <>
                Already have an account?{" "}
                <a
                  href={ROUTES.LOGIN}
                  className="ml-1 text-primary hover:underline underline-offset-4"
                >
                  Log in
                </a>
              </>
            }
          />
        </CardContent>
      </Card>

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
