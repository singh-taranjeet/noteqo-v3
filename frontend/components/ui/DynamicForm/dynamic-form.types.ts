/** Supported field input types for the DynamicForm component. */
export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'radio';

/** A single option for select / radio field types. */
export interface FormFieldOption {
  label: string;
  value: string;
}

/**
 * Configuration for a single form field.
 * Drives what the DynamicForm renders for each row.
 */
export interface FormFieldConfig {
  /** Unique key — maps to the value in the form data record. */
  name: string;
  /** Human-readable label rendered above/beside the field. */
  label: string;
  /** Determines which Shadcn primitive is rendered. */
  type: FormFieldType;
  /** Placeholder text (for text-like inputs and textarea). */
  placeholder?: string;
  /** Helper description rendered below the input. */
  description?: string;
  /** Whether the field is required for submission. */
  required?: boolean;
  /** Whether the field is disabled regardless of form-level disabled state. */
  disabled?: boolean;
  /** Options list — required for 'select' and 'radio' types. */
  options?: FormFieldOption[];
  /** Minimum character length (text-like inputs). */
  minLength?: number;
  /** Maximum character length (text-like inputs). */
  maxLength?: number;
  /** Minimum numeric value (number input). */
  min?: number;
  /** Maximum numeric value (number input). */
  max?: number;
  /** HTML autocomplete attribute value. */
  autoComplete?: string;
  /** Optional CSS class override for the field wrapper. */
  className?: string;
}

/** Form data shape — a record of field names to string or boolean values. */
export type FormValues = Record<string, string | boolean>;

/**
 * Props accepted by the DynamicForm component.
 * Pass a `fields` array to declaratively describe the form layout,
 * and an `onSubmit` handler to receive the collected values.
 */
export interface DynamicFormProps {
  /** Ordered list of field configurations to render. */
  fields: FormFieldConfig[];
  /** Optional initial values keyed by field name. */
  initialValues?: FormValues;
  /** Called with collected form values on valid submission. */
  onSubmit: (values: FormValues) => void | Promise<void>;
  /** Text for the submit button (default: "Submit"). */
  submitLabel?: string;
  /** Text shown on the submit button while isLoading is true. */
  loadingLabel?: string;
  /** When true, disables all fields and shows the loading label on the button. */
  isLoading?: boolean;
  /** Form-level error message displayed as a banner above the fields. */
  error?: string | null;
  /** Optional className applied to the outer <form> element. */
  className?: string;
  /** When true, disables all fields and the submit button. */
  disabled?: boolean;
  /** Optional footer content rendered below the submit button (e.g. links). */
  footer?: React.ReactNode;
}
