import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// Precache all build assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Push Notification Listeners
self.addEventListener("push", function (event: PushEvent) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event: NotificationEvent) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
