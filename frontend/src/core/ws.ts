import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from './types';

const wsUrl = import.meta.env.VITE_WS_URL ?? '/ws';

/**
 * STOMP 클라이언트 래퍼.
 * - CONNECT 시 Authorization 헤더로 JWT 전달 (백엔드 StompAuthChannelInterceptor 가 검증)
 * - 방마다 /topic/rooms/{id} 구독
 * - /app/rooms/{id}/send 로 발신
 */
export class ChatSocket {
  private client: Client;
  private subscriptions = new Map<string, () => void>();
  private userQueueSubscribed = false;

  constructor(token: string, onConnect: () => void) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect,
    });
  }

  activate() {
    this.client.activate();
  }

  deactivate() {
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions.clear();
    void this.client.deactivate();
  }

  subscribeRoom(roomId: string, handler: (msg: ChatMessage) => void) {
    if (this.subscriptions.has(roomId)) return;
    const sub = this.client.subscribe(`/topic/rooms/${roomId}`, (frame: IMessage) => {
      handler(JSON.parse(frame.body) as ChatMessage);
    });
    this.subscriptions.set(roomId, () => sub.unsubscribe());
  }

  /** 개인 큐: 새 방 생성/초대 알림. 받으면 방 목록을 새로 불러온다. */
  subscribeUserQueue(handler: () => void) {
    if (this.userQueueSubscribed) return;
    this.client.subscribe('/user/queue/rooms', () => handler());
    this.userQueueSubscribed = true;
  }

  send(roomId: string, content: string) {
    this.client.publish({
      destination: `/app/rooms/${roomId}/send`,
      body: JSON.stringify({ content }),
    });
  }

  get connected() {
    return this.client.connected;
  }
}
