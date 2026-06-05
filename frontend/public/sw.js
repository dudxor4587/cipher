self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  const title = data.title || '새 메시지';
  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, {
        body: data.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'cipher-message',
        renotify: true,
      });
      if (self.navigator && 'setAppBadge' in self.navigator) {
        try {
          await self.navigator.setAppBadge();
        } catch (e) {
          /* ignore */
        }
      }
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (clients.length > 0) {
        await clients[0].focus();
      } else {
        await self.clients.openWindow('/');
      }
      if (self.navigator && 'clearAppBadge' in self.navigator) {
        try {
          await self.navigator.clearAppBadge();
        } catch (e) {
          /* ignore */
        }
      }
    })(),
  );
});
