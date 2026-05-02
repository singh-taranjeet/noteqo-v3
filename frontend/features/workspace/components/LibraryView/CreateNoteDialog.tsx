import { useState } from "react";
import { useCreateNote } from "@/features/workspace/hooks/useCreateNote";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Space } from "@/features/spaces/types/spaces.types";

interface CreateNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spaces: Space[];
  defaultSpaceId?: string;
  spaceTypeLabel?: string;
}

export function CreateNoteDialog({
  isOpen,
  onOpenChange,
  spaces,
  defaultSpaceId,
  spaceTypeLabel = "space",
}: CreateNoteDialogProps) {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    defaultSpaceId || (spaces.length > 0 ? spaces[0].id : ""),
  );

  const { mutate: createNote, isPending } = useCreateNote();

  const handleCreate = () => {
    if (!selectedSpaceId) return;
    createNote(
      { spaceId: selectedSpaceId },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Select a {spaceTypeLabel} where this new page will be created.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select
            value={selectedSpaceId}
            onValueChange={setSelectedSpaceId}
            disabled={isPending || spaces.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select a ${spaceTypeLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {spaces.map((space) => (
                <SelectItem key={space.id} value={space.id}>
                  {space.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedSpaceId || isPending || spaces.length === 0}
          >
            {isPending ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              "Create Page"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
