
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DynamicDialogProps } from "./dynamic-dialog.types";

/**
 * DynamicDialog — a configuration-driven, reusable dialog wrapper.
 *
 * Composes the existing Shadcn Dialog primitives into a single component
 * that accepts a title, description, body content, and an ordered list of
 * action buttons. Supports both controlled (`isOpen` + `onOpenChange`) and
 * uncontrolled (`trigger`) usage patterns.
 *
 * @example
 * ```tsx
 * // Controlled usage
 * <DynamicDialog
 *   title="Confirm Deletion"
 *   description="This action cannot be undone."
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   actions={[
 *     { label: 'Cancel', onClick: () => setIsOpen(false), variant: 'outline' },
 *     { label: 'Delete', onClick: handleDelete, variant: 'destructive' },
 *   ]}
 * >
 *   <p>Are you sure you want to delete this item?</p>
 * </DynamicDialog>
 *
 * // Uncontrolled usage with trigger
 * <DynamicDialog
 *   title="Settings"
 *   trigger={<Button variant="outline">Open Settings</Button>}
 *   actions={[{ label: 'Save', onClick: handleSave }]}
 * >
 *   <SettingsForm />
 * </DynamicDialog>
 * ```
 */
export function DynamicDialog({
  title,
  description,
  children,
  isOpen,
  onOpenChange,
  trigger,
  showCloseButton = true,
  actions,
  className,
  footerClassName,
}: DynamicDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* ── Optional trigger (uncontrolled mode) ── */}
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        showCloseButton={showCloseButton}
        className={cn("sm:max-w-md", className)}
      >
        {/* ── Header ── */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* ── Body ── */}
        {children}

        {/* ── Footer with action buttons ── */}
        {actions && actions.length > 0 && (
          <DialogFooter className={footerClassName}>
            {actions.map((action) => {
              const button = (
                <Button
                  key={action.label}
                  variant={action.variant ?? "default"}
                  disabled={action.disabled}
                  onClick={action.onClick}
                  className={cn("w-full sm:w-auto", action.className)}
                >
                  {action.label}
                </Button>
              );

              // Wrap in DialogClose to auto-close after click when closesDialog !== false
              if (action.closesDialog !== false) {
                return (
                  <DialogClose key={action.label} asChild>
                    {button}
                  </DialogClose>
                );
              }

              return button;
            })}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
