import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarUserProfileProps {
  username: string;
  avatarEmoji?: string;
  onCloseSidebar?: () => void;
}

export function SidebarUserProfile({
  username,
  avatarEmoji = '😎',
  onCloseSidebar,
}: SidebarUserProfileProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 group">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg shrink-0" role="img" aria-label="User avatar">
          {avatarEmoji}
        </span>
        <span className="text-sm font-medium truncate">{username}</span>
      </div>

      {onCloseSidebar && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCloseSidebar}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
              aria-label="Close sidebar"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Close sidebar</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
