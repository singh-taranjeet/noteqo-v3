import { useParams } from "react-router-dom";
import { NoteEditor } from "@/features/editor";

export function NotePageWrapper() {
  const { note_id } = useParams<{ note_id: string }>();

  if (!note_id) return null;

  return <NoteEditor noteId={note_id} />;
}
