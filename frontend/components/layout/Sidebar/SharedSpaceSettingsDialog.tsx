"use client";

import { useState } from "react";
import { DynamicDialog } from "@/components/ui/DynamicDialog";
import { DynamicForm } from "@/components/ui/DynamicForm";
import type { FormFieldConfig, FormValues } from "@/components/ui/DynamicForm";
import {
  useSpaceMembers,
  useAddSpaceMember,
  useRemoveSpaceMember,
  SPACES_MESSAGES,
} from "@/features/spaces";
import { Button } from "@/components/ui/button";
import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Space } from "@/features/spaces";
import { logService } from "@/services";

interface SharedSpaceSettingsDialogProps {
  space: Space | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const INVITE_FIELDS: FormFieldConfig[] = [
  {
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "user@example.com",
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
  },
];

export function SharedSpaceSettingsDialog({
  space,
  isOpen,
  onOpenChange,
}: SharedSpaceSettingsDialogProps) {
  const { data: members = [], isLoading: isMembersLoading } = useSpaceMembers(
    space?.id ?? "",
  );
  const { mutateAsync: addMember, isPending: isAdding } = useAddSpaceMember();
  const { mutateAsync: removeMember } = useRemoveSpaceMember();

  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (values: FormValues) => {
    if (!space) return;
    setError(null);
    try {
      await addMember({
        spaceId: space.id,
        email: values.email as string,
        role: values.role as string,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : SPACES_MESSAGES.INVITE_FAILED,
      );
    }
  };

  const handleRemove = async (userId: string) => {
    if (!space) return;
    try {
      await removeMember({ spaceId: space.id, userId });
    } catch (err) {
      logService.error("Failed to remove member", err);
    }
  };

  if (!space) return null;

  return (
    <DynamicDialog
      title={`Settings: ${space.name}`}
      description="Manage members and access for this shared space."
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Members List */}
        <div>
          <h4 className="text-sm font-medium mb-3">Members</h4>
          {isMembersLoading ? (
            <p className="text-xs text-muted-foreground animate-pulse">
              Loading members...
            </p>
          ) : members.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No members yet. You are the only one here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {member.name || member.email || member.userId}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(member.userId)}
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full h-px bg-border" />

        {/* Invite Form */}
        <div>
          <h4 className="text-sm font-medium mb-3">Invite Member</h4>
          {error && <p className="text-xs text-destructive mb-3">{error}</p>}
          <DynamicForm
            fields={INVITE_FIELDS}
            onSubmit={handleInvite}
            submitLabel="Send Invite"
            loadingLabel="Inviting..."
            isLoading={isAdding}
          />
        </div>
      </div>
    </DynamicDialog>
  );
}
