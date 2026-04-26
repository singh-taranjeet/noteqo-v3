import { Metadata } from "next";
import { OfflineView } from "@/features/pwa";

export const metadata: Metadata = {
  title: "Offline - Noteqo",
};

export default function OfflinePage() {
  return <OfflineView />;
}
