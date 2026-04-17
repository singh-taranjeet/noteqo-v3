"use client";

import { useCallback } from "react";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { AUTH_CONFIG } from "../../constants/auth.constants";

import type { DialogAction } from "@/components/ui/DynamicDialog";

interface RecoveryCodeDialogProps {
  isOpen: boolean;
  masterKey: string;
  onClose: () => void;
}

export function RecoveryCodeDialog({
  isOpen,
  masterKey,
  onClose,
}: RecoveryCodeDialogProps) {
  const handleDownload = useCallback(() => {
    const element = document.createElement("a");
    const file = new Blob([masterKey], {
      type: AUTH_CONFIG.RECOVERY_FILE_TYPE,
    });
    element.href = URL.createObjectURL(file);
    element.download = AUTH_CONFIG.RECOVERY_FILE_NAME;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  }, [masterKey]);

  const actions: DialogAction[] = [
    {
      label: "Download .txt",
      onClick: handleDownload,
      variant: "secondary",
      closesDialog: false,
    },
    {
      label: "I've Safely Stored It",
      onClick: onClose,
    },
  ];

  return (
    <DynamicDialog
      title="Save Your Recovery Code"
      description="This is your Master Encryption Key. You must save it somewhere safe. If you lose this key, you will permanently lose access to your encrypted documents. We do not store this key and cannot recover it for you."
      isOpen={isOpen}
      onOpenChange={() => {}}
      showCloseButton={false}
      actions={actions}
      footerClassName="sm:justify-between"
    >
      <div className="flex items-center space-x-2">
        <div className="grid flex-1 gap-2">
          <div className="rounded-md border bg-muted p-4 font-mono text-xs break-all selection:bg-primary/30">
            {masterKey}
          </div>
        </div>
      </div>
    </DynamicDialog>
  );
}
