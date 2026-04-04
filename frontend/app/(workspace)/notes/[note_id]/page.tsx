import { NoteEditor } from "@/features/editor";

export default async function NotePage({
  params,
}: Readonly<{
  params: Promise<{ note_id: string }>;
}>) {
  const { note_id } = await params;
  return <NoteEditor noteId={note_id} />;
}
