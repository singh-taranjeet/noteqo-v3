"use client";
import { Loader2 } from "lucide-react";

import * as React from "react";
import { useState, useCallback } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

import type {
  DynamicFormProps,
  FormFieldConfig,
  FormValues,
} from "./dynamic-form.types";

/** Set of field types that render a standard text-like <Input> element. */
const TEXT_INPUT_TYPES = new Set([
  "text",
  "email",
  "password",
  "number",
  "tel",
  "url",
] as const);

/**
 * DynamicForm — a configuration-driven, reusable form renderer.
 *
 * Pass a `fields` array describing each input and a typed `onSubmit` handler.
 * The component renders consistent, accessible forms using existing Shadcn UI
 * primitives, ensuring a unified design language across the application.
 *
 * @example
 * ```tsx
 * <DynamicForm
 *   fields={[
 *     { name: 'email', label: 'Email', type: 'email', required: true },
 *     { name: 'password', label: 'Password', type: 'password', required: true, minLength: 8 },
 *   ]}
 *   onSubmit={(values) => console.log(values)}
 *   submitLabel="Sign In"
 * />
 * ```
 */
export function DynamicForm({
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Submit",
  loadingLabel = "Processing…",
  isLoading = false,
  error = null,
  className,
  disabled = false,
  footer,
}: DynamicFormProps) {
  const [formValues, setFormValues] = useState<FormValues>(() => {
    const defaults: FormValues = {};
    for (const field of fields) {
      const isToggle = field.type === "checkbox" || field.type === "switch";
      defaults[field.name] =
        initialValues[field.name] ?? (isToggle ? false : "");
    }
    return defaults;
  });

  const handleChange = useCallback((name: string, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formValues);
    },
    [formValues, onSubmit],
  );

  const isFieldDisabled = disabled || isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
      noValidate={false}
    >
      {/* ── Form-level error banner ── */}
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* ── Dynamic field list ── */}
      {fields.map((field) => (
        <FormField
          key={field.name}
          config={field}
          value={formValues[field.name] ?? ""}
          onChange={handleChange}
          disabled={isFieldDisabled || !!field.disabled}
        />
      ))}

      {/* ── Submit button ── */}
      <Button
        type="submit"
        className="w-full font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        disabled={isFieldDisabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>

      {/* ── Optional footer slot ── */}
      {footer && (
        <div className="flex justify-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </form>
  );
}

/* ─────────────────────────────────────────────────────────
   Internal field renderer — delegates to the correct
   Shadcn primitive based on field.type
   ───────────────────────────────────────────────────────── */

interface FormFieldProps {
  config: FormFieldConfig;
  value: string | boolean;
  onChange: (name: string, value: string | boolean) => void;
  disabled: boolean;
}

function FormField({ config, value, onChange, disabled }: FormFieldProps) {
  const {
    name,
    label,
    type,
    placeholder,
    description,
    className: fieldClassName,
  } = config;

  /* ── Text-like inputs (text, email, password, number, tel, url) ── */
  if (
    TEXT_INPUT_TYPES.has(
      type as typeof TEXT_INPUT_TYPES extends Set<infer U> ? U : never,
    )
  ) {
    return (
      <Field className={fieldClassName}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input
          id={name}
          name={name}
          type={type}
          required={config.required}
          placeholder={placeholder}
          value={value as string}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          minLength={config.minLength}
          maxLength={config.maxLength}
          min={config.min}
          max={config.max}
          autoComplete={config.autoComplete}
          className="transition-colors focus:ring-primary/50"
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    );
  }

  /* ── Textarea ── */
  if (type === "textarea") {
    return (
      <Field className={fieldClassName}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Textarea
          id={name}
          name={name}
          required={config.required}
          placeholder={placeholder}
          value={value as string}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          minLength={config.minLength}
          maxLength={config.maxLength}
          className="transition-colors focus:ring-primary/50"
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    );
  }

  /* ── Select ── */
  if (type === "select") {
    return (
      <Field className={fieldClassName}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Select
          value={value as string}
          onValueChange={(v) => onChange(name, v)}
          disabled={disabled}
          required={config.required}
        >
          <SelectTrigger className="w-full transition-colors">
            <SelectValue placeholder={placeholder ?? "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {config.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    );
  }

  /* ── Checkbox ── */
  if (type === "checkbox") {
    return (
      <Field
        orientation="horizontal"
        className={cn("items-center", fieldClassName)}
      >
        <Checkbox
          id={name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(name, !!checked)}
          disabled={disabled}
          required={config.required}
        />
        <div className="flex flex-col gap-0.5">
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          {description && <FieldDescription>{description}</FieldDescription>}
        </div>
      </Field>
    );
  }

  /* ── Switch ── */
  if (type === "switch") {
    return (
      <Field
        orientation="horizontal"
        className={cn("items-center justify-between", fieldClassName)}
      >
        <div className="flex flex-col gap-0.5">
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          {description && <FieldDescription>{description}</FieldDescription>}
        </div>
        <Switch
          id={name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(name, checked)}
          disabled={disabled}
        />
      </Field>
    );
  }

  /* ── Radio Group ── */
  if (type === "radio") {
    return (
      <Field className={fieldClassName}>
        <FieldLabel>{label}</FieldLabel>
        <RadioGroup
          value={value as string}
          onValueChange={(v) => onChange(name, v)}
          disabled={disabled}
          required={config.required}
        >
          {config.options?.map((opt) => (
            <Field
              key={opt.value}
              orientation="horizontal"
              className="items-center"
            >
              <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
              <FieldLabel htmlFor={`${name}-${opt.value}`}>
                {opt.label}
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    );
  }

  /* ── Fallback — should never happen with strict typing ── */
  return null;
}
