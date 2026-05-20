"use client";

import { useMemo } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import type { CollaborationConnectionState } from "@/features/realtime/types/collaboration.types";
import { COLLABORATION_CONFIG } from "@/features/realtime/constants/collaboration.constants";

/** Maximum avatars to display before showing a "+N" count */
const MAX_VISIBLE_AVATARS = 4;

export interface CollaboratorUser {
  userId: string;
  name?: string;
  color?: string;
}

interface CollaborationAvatarsProps {
  /** List of users currently in the collaborative session */
  users: CollaboratorUser[];
  /** Current WebSocket connection state */
  connectionState: CollaborationConnectionState;
}

/**
 * Displays a stack of avatar circles for users currently editing a shared note.
 * Uses shadcn Avatar, AvatarGroup, Tooltip, and Badge components.
 *
 * Shows a connection status indicator and overlapping user avatars with
 * initials and assigned colors. Overflows into a "+N" count badge.
 */
export function CollaborationAvatars({
  users,
  connectionState,
}: Readonly<CollaborationAvatarsProps>) {
  const visibleUsers = users.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = Math.max(users.length - MAX_VISIBLE_AVATARS, 0);

  const connectionLabel = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting…";
      case "reconnecting":
        return "Reconnecting…";
      case "disconnected":
        return "Offline";
    }
  }, [connectionState]);

  const ConnectionIcon = useMemo(() => {
    switch (connectionState) {
      case "connected":
        return <Wifi className="size-3" />;
      case "connecting":
      case "reconnecting":
        return <Loader2 className="size-3 animate-spin" />;
      case "disconnected":
        return <WifiOff className="size-3" />;
    }
  }, [connectionState]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2">
        {/* Connection status badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`gap-1.5 text-xs px-2 py-0.5 transition-colors ${
                connectionState === "connected"
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : connectionState === "disconnected"
                    ? "border-destructive/30 text-destructive"
                    : "border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
              }`}
            >
              {ConnectionIcon}
              <span className="hidden sm:inline">{connectionLabel}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{connectionLabel}</p>
          </TooltipContent>
        </Tooltip>

        {/* User avatars */}
        {users.length > 0 && (
          <AvatarGroup className="gap-4">
            {visibleUsers.map((user, index) => {
              const initials = getInitials(user.name || user.userId);
              const color =
                user.color ||
                COLLABORATION_CONFIG.USER_COLORS[
                  index % COLLABORATION_CONFIG.USER_COLORS.length
                ];

              return (
                <Tooltip key={user.userId}>
                  <TooltipTrigger asChild>
                    <Avatar size="sm">
                      <AvatarFallback
                        style={{
                          backgroundColor: color,
                          color: "var(--foreground)",
                        }}
                        className="text-[10px] font-semibold"
                      >
                        {initials}
                      </AvatarFallback>
                      <AvatarBadge className="bg-emerald-500" />
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{user.name || user.userId.slice(0, 8)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {overflowCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AvatarGroupCount className="text-[10px]">
                    +{overflowCount}
                  </AvatarGroupCount>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>
                    {overflowCount} more{" "}
                    {overflowCount === 1 ? "user" : "users"}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </AvatarGroup>
        )}
      </div>
    </TooltipProvider>
  );
}

/** Extracts up to 2-letter initials from a name or email prefix */
function getInitials(name: string): string {
  const parts = name
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0]?.[0] ?? "?").toUpperCase();
}
