import { useParams } from "react-router-dom";
import { NoteEditor } from "@/features/editor";

/**
 * Bridges React Router's useParams to NoteEditor's noteId prop.
 * In Next.js this was handled by the [note_id] page params.
 */
export function NotePageWrapper() {
  const { note_id } = useParams<{ note_id: string }>();

  if (!note_id) return null;

  return <NoteEditor noteId={note_id} />;
}
