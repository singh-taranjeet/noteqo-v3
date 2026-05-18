import { type Note } from "@/features/workspace";
import { NoteEditorSurface } from "./NoteEditorSurface";
import { NoteEditorSkeleton } from "./NoteEditorSkeleton";
import { useNoteEditorLogic } from "../hooks/useNoteEditorLogic";
import { CollaborationAvatars } from "./CollaborationAvatars";
import type { CollaboratorUser } from "./CollaborationAvatars";
import { useMemo } from "react";

interface NoteEditorProps {
  noteId: string;
  initialNote?: Note;
  isReadOnly?: boolean;
  className?: string;
  contentWrapperClassName?: string;
}

export function NoteEditor({
  noteId,
  initialNote,
  isReadOnly = false,
  className,
  contentWrapperClassName,
}: Readonly<NoteEditorProps>) {
  const {
    editor,
    note,
    loading,
    isTrashed,
    editorIsReadOnly,
    spaceId,
    handleTitleChange,
    handleTitleBlur,
    updateCoverImage,
    updateEmoji,
    isCollaborating,
    connectionState,
    roomUsers,
  } = useNoteEditorLogic({ noteId, initialNote, isReadOnly });

  // Map room users to the avatar component's shape
  const collaborators: CollaboratorUser[] = useMemo(
    () =>
      roomUsers.map((u) => ({
        userId: u.userId,
      })),
    [roomUsers],
  );

  if (loading) {
    return <NoteEditorSkeleton />;
  }

  if (!editor) return null;

  const isSharedSpace = note?.type === "shared";

  return (
    <>
      {/* Collaboration bar — only visible for shared notes */}
      {isSharedSpace && (
        <div className="flex items-center justify-end px-4 py-2 border-b bg-background/50 backdrop-blur-sm shrink-0">
          <CollaborationAvatars
            users={collaborators}
            connectionState={connectionState}
          />
        </div>
      )}

      <NoteEditorSurface
        editor={editor}
        title={note?.title}
        emoji={note?.emoji ?? ""}
        coverImage={note?.coverImage ?? ""}
        isReadOnly={editorIsReadOnly}
        isTrashed={isTrashed}
        spaceId={spaceId ?? undefined}
        noteId={noteId}
        onUpdateCoverImage={updateCoverImage}
        onUpdateEmoji={updateEmoji}
        onTitleChange={handleTitleChange}
        onTitleBlur={handleTitleBlur}
        className={className}
        contentWrapperClassName={contentWrapperClassName}
      />
    </>
  );
}
