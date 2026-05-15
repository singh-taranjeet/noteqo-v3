import { useState, useEffect, useMemo } from "react";
import { Loader2, Trash2, Search } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState<string | undefined>();
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.email?.toLowerCase().includes(query) ||
        m.name?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Clear selections when search changes or members list changes
  useEffect(() => {
    setSelectedMembers([]);
  }, [searchQuery, members]);

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
      setSelectedMembers((prev) => prev.filter((id) => id !== userId));
    } catch (error) {
      toast.error((error as Error).message || "Failed to remove member");
    }
  };

  const handleBulkRemove = async () => {
    if (selectedMembers.length === 0) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    for (const userId of selectedMembers) {
      try {
        await removeMemberMutation.mutateAsync({ spaceId, userId });
        successCount++;
      } catch (error) {
        console.error(error);
      }
    }
    setIsBulkDeleting(false);
    if (successCount > 0) {
      toast.success(`Removed ${successCount} member(s)`);
      setSelectedMembers([]);
    } else {
      toast.error("Failed to remove members");
    }
  };

  const handleBulkRoleChange = (newRole: string) => {
    setBulkRole(newRole);
    if (selectedMembers.length === 0) return;
    toast.error("Role changes are not supported by the server yet");
    // TODO: implement bulk role update once backend supports it
    setBulkRole(undefined);
  };

  const toggleSelection = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m) => m.userId));
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

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Current Members</h4>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMembers.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md border">
            <span className="text-sm font-medium">
              {selectedMembers.length} selected
            </span>
            <div className="flex items-center gap-2">
              <Select value={bulkRole || ""} onValueChange={handleBulkRoleChange}>
                <SelectTrigger className="h-8 w-32 bg-background">
                  <SelectValue placeholder="Change Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="destructive"
                size="sm"
                className="h-8"
                onClick={handleBulkRemove}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* List Header */}
        {filteredMembers.length > 0 && (
          <div className="flex items-center px-2 py-1 mt-2">
            <Checkbox
              checked={
                selectedMembers.length > 0 &&
                selectedMembers.length === filteredMembers.length
              }
              onCheckedChange={toggleSelectAll}
              className="mr-3"
            />
            <span className="text-xs text-muted-foreground ml-1">Select All</span>
          </div>
        )}

        <ScrollArea className="h-[240px] border rounded-md">
          <div className="flex flex-col p-1">
            {filteredMembers.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {members?.length === 0 ? "No members yet" : "No members found"}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-sm group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedMembers.includes(member.userId)}
                      onCheckedChange={() => toggleSelection(member.userId)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {member.email || member.name || "Unknown User"}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {member.role.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMember(member.userId)}
                    disabled={removeMemberMutation.isPending || isBulkDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
