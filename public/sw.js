'use strict';

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'RealTimeMood';
  const options = {
    body: data.body || 'How are you feeling right now?',
    // Note: You can add 'icon' and 'badge' properties if you have assets in /public
    // icon: '/icon-192x192.png',
    // badge: '/badge-72x72.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // This focuses the existing app window or opens a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
