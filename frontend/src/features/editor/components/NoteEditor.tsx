import { type Note } from "@/features/workspace";
import { NoteEditorSurface } from "./NoteEditorSurface";
import { NoteEditorSkeleton } from "./NoteEditorSkeleton";
import { useNoteEditorLogic } from "../hooks/useNoteEditorLogic";
import { CollaborationAvatars } from "./CollaborationAvatars";
import type { CollaboratorUser } from "./CollaborationAvatars";
import { useMemo } from "react";
import { useNote } from "@/features/workspace";

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
  const { note, loading } = useNote({
    id: noteId,
    initialNote,
    readonly: isReadOnly,
  });

  if (loading || !note) {
    return <NoteEditorSkeleton />;
  }

  return (
    <NoteEditorInner
      noteId={noteId}
      note={note}
      isReadOnly={isReadOnly}
      className={className}
      contentWrapperClassName={contentWrapperClassName}
    />
  );
}

interface NoteEditorInnerProps extends NoteEditorProps {
  note: Note;
}

function NoteEditorInner({
  noteId,
  note,
  isReadOnly = false,
  className,
  contentWrapperClassName,
}: Readonly<NoteEditorInnerProps>) {
  const {
    editor,
    isTrashed,
    editorIsReadOnly,
    spaceId,
    handleTitleChange,
    handleTitleBlur,
    updateCoverImage,
    updateEmoji,
    connectionState,
    roomUsers,
  } = useNoteEditorLogic({ noteId, note, isReadOnly });

  // Map room users to the avatar component's shape
  const collaborators: CollaboratorUser[] = useMemo(
    () =>
      roomUsers.map((u) => ({
        userId: u.userId,
        name: u.email?.split("@")[0] || u.userId.slice(0, 8),
      })),
    [roomUsers],
  );

  if (!editor) return null;

  const isSharedSpace = note?.type === "shared";

  return (
    <>
      {/* Collaboration bar — only visible for shared notes */}
      {isSharedSpace && !isReadOnly && (
        <div className="absolute top-11 right-0 h-10 z-50 w-fit">
          <div className="flex mt-3 mr-3 items-center justify-end px-4 py-2 border-transparent bg-glass rounded-full backdrop-blur-sm shrink-0">
            <CollaborationAvatars
              users={collaborators}
              connectionState={connectionState}
            />
          </div>
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
