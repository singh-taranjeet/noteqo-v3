import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { NoteEditor } from "@/features/editor";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PreviewNoteDialogProps {
  noteId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewNoteDialog({
  noteId,
  isOpen,
  onClose,
}: Readonly<PreviewNoteDialogProps>) {
  if (!noteId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[95vw] max-w-[95vw] w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden bg-background">
        <VisuallyHidden>
          <DialogTitle>Note Preview</DialogTitle>
          <DialogDescription>
            A read-only preview of the deleted note.
          </DialogDescription>
        </VisuallyHidden>
        <div className="flex-1 overflow-y-auto">
          <NoteEditor noteId={noteId} isReadOnly={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
