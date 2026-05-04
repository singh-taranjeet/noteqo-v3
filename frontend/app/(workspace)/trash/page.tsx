import { TrashView } from "@/features/workspace";

export const metadata = {
  title: "Trash - Noteqo",
  description: "View and restore deleted notes.",
};

export default function TrashPage() {
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      <TrashView />
    </div>
  );
}
