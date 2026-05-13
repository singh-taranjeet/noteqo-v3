
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InstallPrompt } from "./InstallPrompt";
import { PushNotificationManager } from "./PushNotificationManager";

interface PWASettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PWASettingsDialog({
  open,
  onOpenChange,
}: PWASettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <InstallPrompt />
          <PushNotificationManager />
        </div>
      </DialogContent>
    </Dialog>
  );
}
