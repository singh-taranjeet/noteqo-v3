import { DocumentEditor } from "@/features/editor";

export default async function NotePage({
  params,
}: {
  params: Promise<{ note_id: string }>;
}) {
  const { note_id } = await params;
  return <DocumentEditor noteId={note_id} />;
}
