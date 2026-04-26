'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-card">
      <h3 className="text-lg font-semibold">Install App</h3>
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
          To install this app on your iOS device, tap the share button{' '}
          <span role="img" aria-label="share icon">
            ⎋
          </span>{' '}
          and then <strong>"Add to Home Screen"</strong>{' '}
          <span role="img" aria-label="plus icon">
            ➕
          </span>.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Look for the install icon in your browser's address bar to add this app to your device.
        </p>
      )}
    </div>
  );
}
