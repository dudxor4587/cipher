import { api } from './api';

const SW_PATH = '/sw.js';
const ENABLED_KEY = 'cipher.push';

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushEnabled(): boolean {
  return localStorage.getItem(ENABLED_KEY) === '1';
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// 알림 ON: 권한 요청 → 서비스워커 등록 → 구독 → 서버 저장
export async function enablePush(): Promise<void> {
  if (!pushSupported()) throw new Error('이 브라우저는 알림을 지원하지 않습니다.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('알림 권한이 거부되었습니다.');

  const reg = await navigator.serviceWorker.register(SW_PATH);
  await navigator.serviceWorker.ready;

  const { data } = await api.get<{ publicKey: string }>('/push-subscriptions/key');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.publicKey) as BufferSource,
  });
  await api.post('/push-subscriptions', sub.toJSON());
  localStorage.setItem(ENABLED_KEY, '1');
}

// 알림 OFF: 구독 해제 + 서버에서 제거
export async function disablePush(): Promise<void> {
  localStorage.removeItem(ENABLED_KEY);
  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH);
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await api.delete('/push-subscriptions', { data: { endpoint: sub.endpoint } });
      await sub.unsubscribe();
    }
  } catch {
    /* ignore */
  }
  await clearBadge();
}

export async function setBadge(count: number): Promise<void> {
  const nav = navigator as Navigator & {
    setAppBadge?: (n?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  try {
    if (count > 0 && nav.setAppBadge) await nav.setAppBadge(count);
    else if (nav.clearAppBadge) await nav.clearAppBadge();
  } catch {
    /* ignore */
  }
}

export async function clearBadge(): Promise<void> {
  await setBadge(0);
}
