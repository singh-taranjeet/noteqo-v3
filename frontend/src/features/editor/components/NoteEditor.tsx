import { type Note } from "@/features/workspace";
import { NoteEditorSurface } from "./NoteEditorSurface";
import { NoteEditorSkeleton } from "./NoteEditorSkeleton";
import { useNoteEditorLogic } from "../hooks/useNoteEditorLogic";

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
  } = useNoteEditorLogic({ noteId, initialNote, isReadOnly });

  if (loading) {
    return <NoteEditorSkeleton />;
  }

  if (!editor) return null;

  return (
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
  );
}
