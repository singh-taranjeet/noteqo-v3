import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from '@/components/ui/button';

/** Configuration for a single dialog action button. */
export interface DialogAction {
  /** Text label displayed inside the button. */
  label: string;
  /** Click handler invoked when the button is pressed. */
  onClick: () => void;
  /** Button visual variant (default: 'default'). */
  variant?: VariantProps<typeof buttonVariants>['variant'];
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Whether to close the dialog after clicking (default: true). */
  closesDialog?: boolean;
  /** Optional CSS class override for this button. */
  className?: string;
}

/**
 * Props accepted by the DynamicDialog component.
 *
 * Pass `isOpen` + `onOpenChange` for controlled usage,
 * or use `trigger` for uncontrolled usage.
 */
export interface DynamicDialogProps {
  /** Dialog title — rendered in the header. */
  title: string;
  /** Optional description text below the title. */
  description?: string;
  /** The main body content of the dialog. */
  children: React.ReactNode;
  /** Controlled open state. */
  isOpen?: boolean;
  /** Callback when open state changes (close requested). */
  onOpenChange?: (open: boolean) => void;
  /** Optional trigger element that opens the dialog (uncontrolled mode). */
  trigger?: React.ReactNode;
  /** Whether to show the close (×) button in the top-right corner (default: true). */
  showCloseButton?: boolean;
  /** Ordered list of action buttons rendered in the footer. */
  actions?: DialogAction[];
  /** Optional CSS class override for the dialog content panel. */
  className?: string;
  /** Optional CSS class override for the footer. */
  footerClassName?: string;
}
