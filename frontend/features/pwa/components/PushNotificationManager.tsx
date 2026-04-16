"use client";

import { useState, useEffect } from "react";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "../actions/pwa.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);
      toast.success("Subscribed to notifications!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to subscribe to notifications.");
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
      toast.success("Unsubscribed from notifications.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to unsubscribe.");
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      const result = await sendNotification(message || "Hello from Noteqo!");
      if (result.success) {
        toast.success("Notification sent!");
      } else {
        toast.error("Failed to send notification.");
      }
      setMessage("");
    }
  }

  if (!isSupported) {
    return (
      <p className="text-sm text-muted-foreground">
        Push notifications are not supported in this browser.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-card">
      <h3 className="text-lg font-semibold">Push Notifications</h3>
      {subscription ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are subscribed to push notifications.
          </p>
          <Button variant="destructive" onClick={unsubscribeFromPush}>
            Unsubscribe
          </Button>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendTestNotification}>Send Test</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are not subscribed to push notifications.
          </p>
          <Button onClick={subscribeToPush}>Subscribe</Button>
        </div>
      )}
    </div>
  );
}
