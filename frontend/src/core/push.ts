import { api } from './api';

const SW_PATH = '/sw.js';
const ENABLED_KEY = 'cipher.push';

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// 앱의 활성(포커스+보임) 상태를 SW 에 보고 → SW 가 푸시 표시 여부 판단.
export function trackActiveState(): void {
  if (!('serviceWorker' in navigator)) return;
  const send = () => {
    const value = document.visibilityState === 'visible' && document.hasFocus();
    navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage({ type: 'active', value }))
      .catch(() => {});
  };
  window.addEventListener('focus', send);
  window.addEventListener('blur', send);
  document.addEventListener('visibilitychange', send);
  send();
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

// 사파리는 no-arg/0 배지가 깨져 있어 숫자를 넘겨야 한다. 크롬은 점(dot) 유지.
const isSafari = /^((?!chrome|chromium|crios|edg).)*safari/i.test(navigator.userAgent);

export async function setBadge(count: number): Promise<void> {
  const nav = navigator as Navigator & {
    setAppBadge?: (n?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  };
  try {
    if (count > 0 && nav.setAppBadge) {
      if (isSafari) await nav.setAppBadge(count);
      else await nav.setAppBadge();
    } else if (nav.clearAppBadge) {
      await nav.clearAppBadge();
    }
  } catch {
    /* ignore */
  }
  // SW 백그라운드 누적 카운트를 실제 미읽음 수로 동기화
  try {
    const reg = await navigator.serviceWorker?.ready;
    reg?.active?.postMessage({ type: 'badge', count });
  } catch {
    /* ignore */
  }
}

export async function clearBadge(): Promise<void> {
  await setBadge(0);
}

// 표시된 OS 알림(배너)을 닫는다 — 읽거나 앱에 돌아오면 dot 이 남지 않게.
export async function clearNotifications(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    const notes = (await reg?.getNotifications()) ?? [];
    notes.forEach((n) => n.close());
  } catch {
    /* ignore */
  }
}
