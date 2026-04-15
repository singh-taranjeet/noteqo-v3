import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';

export function SidebarNewButton() {
  return (
    <div className="sticky bottom-0 border-t border-border bg-sidebar p-2">
      <Button
        variant="ghost"
        className="flex w-full items-center justify-center gap-2 h-8 text-sm font-medium"
      >
        <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={1.5} />
        <span>New</span>
      </Button>
    </div>
  );
}
