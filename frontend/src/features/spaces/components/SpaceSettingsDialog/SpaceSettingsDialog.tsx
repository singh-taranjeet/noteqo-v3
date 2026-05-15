import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Space } from "@/features/spaces";
import { SPACE_TYPE } from "@/features/spaces";
import { spaceService } from "@/features/spaces/services/space.service";
import {
  useSpaceMembers,
  useAddSpaceMember,
  useRemoveSpaceMember,
} from "@/features/spaces/hooks/useSpaceMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SpaceSettingsDialogProps {
  space: Space;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpaceSettingsDialog({
  space,
  isOpen,
  onOpenChange,
}: SpaceSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("general");

  if (!space) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Space Settings</DialogTitle>
          <DialogDescription>
            Manage settings for {space.name}
          </DialogDescription>
        </DialogHeader>

        {space.type === SPACE_TYPE.SHARED ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <TabsContent value="general">
              <GeneralSettingsTab
                space={space}
                onComplete={() => onOpenChange(false)}
              />
            </TabsContent>
            <TabsContent value="members">
              <MembersSettingsTab spaceId={space.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <GeneralSettingsTab
            space={space}
            onComplete={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function GeneralSettingsTab({
  space,
  onComplete,
}: {
  space: Space;
  onComplete: () => void;
}) {
  const [name, setName] = useState(space.name || "");
  const [description, setDescription] = useState(space.description || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(space.name || "");
    setDescription(space.description || "");
  }, [space]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await spaceService.updateSpace(space.id, { name, description });
      toast.success("Space updated successfully");
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update space");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="space-name">Name</Label>
        <Input
          id="space-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Space Name"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="space-desc">Description</Label>
        <Textarea
          id="space-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this space"
          rows={3}
        />
      </div>
      <Button
        onClick={handleSave}
        disabled={isSaving || !name.trim()}
        className="mt-2"
      >
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Changes
      </Button>
    </div>
  );
}

function MembersSettingsTab({ spaceId }: { spaceId: string }) {
  const { data: members, isLoading } = useSpaceMembers(spaceId);
  const addMemberMutation = useAddSpaceMember();
  const removeMemberMutation = useRemoveSpaceMember();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");

  const handleAddMember = async () => {
    if (!email.trim()) return;
    try {
      await addMemberMutation.mutateAsync({ spaceId, email, role });
      setEmail("");
      toast.success("Member invited successfully");
    } catch (error) {
      toast.error((error as Error).message || "Failed to invite member");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ spaceId, userId });
      toast.success("Member removed");
    } catch (error) {
      toast.error((error as Error).message || "Failed to remove member");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="member-email">Invite Member</Label>
          <Input
            id="member-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
          />
        </div>
        <div className="w-32">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleAddMember}
          disabled={addMemberMutation.isPending || !email.trim()}
        >
          {addMemberMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Invite"
          )}
        </Button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-3">Current Members</h4>
        <div className="flex flex-col gap-2">
          {members?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet</p>
          ) : (
            members?.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {member.email || member.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {member.role.toLowerCase()}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={removeMemberMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
