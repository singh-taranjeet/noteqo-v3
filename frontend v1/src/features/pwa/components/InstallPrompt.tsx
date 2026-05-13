
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window),
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Install App</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Install Noteqo to your home screen for a better experience.
        </p>

        {/* 
          A custom button to trigger beforeinstallprompt would go here if supported,
          but since it's highly browser-dependent and not supported on iOS Safari,
          we usually provide instructions or rely on the browser's default prompt.
        */}

        {isIOS ? (
          <p className="text-sm border rounded p-3 bg-muted">
            To install this app on your iOS device, tap the share button{" "}
            <span role="img" aria-label="share icon">
              ⎋
            </span>{" "}
            and then <strong>&quot;Add to Home Screen&quot;</strong>{" "}
            <span role="img" aria-label="plus icon">
              ➕
            </span>
            .
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Look for the install icon in your browser&apos;s address bar to add
            this app to your device.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
