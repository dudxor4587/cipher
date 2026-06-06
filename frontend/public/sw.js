self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// 앱이 활성(포커스+보임) 상태인지를 클라이언트가 알려주면 저장 → 푸시 때 판단에 사용.
// SW 가 죽었다 깨어나도 유지되게 Cache 에 보관.
let activeMem = false;

function isSafari() {
  return /^((?!chrome|chromium|android|crios|edg).)*safari/i.test(self.navigator.userAgent || '');
}

async function cacheGet(key) {
  try {
    const c = await caches.open('cipher-state');
    const r = await c.match(key);
    if (r) return await r.text();
  } catch (e) {
    /* ignore */
  }
  return null;
}

async function cacheSet(key, value) {
  try {
    const c = await caches.open('cipher-state');
    await c.put(key, new Response(value));
  } catch (e) {
    /* ignore */
  }
}

async function setActive(v) {
  activeMem = v;
  await cacheSet('/__active', v ? '1' : '0');
  if (v) await cacheSet('/__badge', '0'); // 앱을 보면 누적 카운트 리셋
}

async function isActive() {
  const v = await cacheGet('/__active');
  if (v != null) return v === '1';
  return activeMem;
}

// 크롬은 점(dot, 인자 없음), 사파리는 숫자 — 사파리는 no-arg/0 배지가 깨져서 숫자를 넘겨야 함.
async function applyBadge(count) {
  const nav = self.navigator;
  if (!nav) return;
  try {
    if (count > 0) {
      if (isSafari()) {
        if ('setAppBadge' in nav) await nav.setAppBadge(count);
      } else if ('setAppBadge' in nav) {
        await nav.setAppBadge();
      }
    } else if ('clearAppBadge' in nav) {
      await nav.clearAppBadge();
    }
  } catch (e) {
    /* ignore */
  }
}

self.addEventListener('message', (event) => {
  const d = event.data;
  if (!d) return;
  if (d.type === 'active') {
    event.waitUntil(setActive(!!d.value));
  } else if (d.type === 'badge') {
    // 인앱에서 실제 미읽음 수를 알려주면 SW 누적 기준값으로 동기화
    event.waitUntil(cacheSet('/__badge', String(Math.max(0, d.count | 0))));
  }
});

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
      // 앱을 직접 보고 있으면(포커스) 실시간으로 보이므로 푸시 생략
      if (await isActive()) {
        return;
      }
      await self.registration.showNotification(title, {
        body: data.body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'cipher-message-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        data: { roomId: data.roomId || '' },
      });
      const n = (parseInt((await cacheGet('/__badge')) || '0', 10) || 0) + 1;
      await cacheSet('/__badge', String(n));
      await applyBadge(n);
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      await cacheSet('/__badge', '0');
      if (self.navigator && 'clearAppBadge' in self.navigator) {
        try {
          await self.navigator.clearAppBadge();
        } catch (e) {
          /* ignore */
        }
      }
      const roomId = (event.notification.data && event.notification.data.roomId) || '';
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const client = all.find((c) => 'focus' in c);
      if (client) {
        try {
          await client.focus();
        } catch (e) {
          /* ignore */
        }
        if (roomId) client.postMessage({ type: 'open-room', roomId: roomId });
      } else if (self.clients.openWindow) {
        await self.clients.openWindow(roomId ? '/?room=' + roomId : '/');
      }
    })(),
  );
});
