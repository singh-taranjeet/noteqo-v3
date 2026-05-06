import { WifiOff } from "lucide-react";

export function OfflineView() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <WifiOff size={48} className="text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        You are offline
      </h1>
      <p className="text-muted-foreground max-w-sm">
        It looks like you've lost your internet connection. Noteqo requires a
        connection to load new pages, but you can still access your previously
        cached notes.
      </p>
    </div>
  );
}
