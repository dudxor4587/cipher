import { create } from 'zustand';
import { friendApi, messageApi, roomApi, setAccessToken, userApi } from './api';
import { ChatSocket } from './ws';
import type { ChatMessage, Me, RoomSummary, UserSummary } from './types';

const TOKEN_KEY = 'cipher.token';
const ME_KEY = 'cipher.me';

interface AppState {
  token: string | null;
  me: Me | null;
  rooms: RoomSummary[];
  friends: UserSummary[];
  activeRoomId: string | null;
  messagesByRoom: Record<string, ChatMessage[]>;
  /** 히스토리를 실제로 불러온 방. 실시간 메시지는 이 방에만 끼워넣는다. */
  loadedRooms: Set<string>;
  /** 방별로 더 과거 메시지가 남았는지 (커서 페이지네이션). */
  hasMoreByRoom: Record<string, boolean>;
  socket: ChatSocket | null;

  bootstrapFromStorage: () => void;
  login: (token: string, me: Me) => void;
  logout: () => void;
  connect: () => void;
  loadRooms: () => Promise<void>;
  loadFriends: () => Promise<void>;
  selectRoom: (roomId: string) => Promise<void>;
  loadOlder: (roomId: string) => Promise<void>;
  sendMessage: (text: string) => void;

  addFriend: (handle: string) => Promise<void>;
  addFriendByUser: (userId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  openDirectWith: (userId: string) => Promise<void>;
  createRoomAndOpen: (room: RoomSummary) => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  inviteToRoom: (roomId: string, memberIds: string[]) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  renameRoom: (roomId: string, title: string) => Promise<void>;
}

function appendMessage(
  map: Record<string, ChatMessage[]>,
  msg: ChatMessage,
): Record<string, ChatMessage[]> {
  const list = map[msg.roomId] ?? [];
  if (list.some((m) => m.id === msg.id)) return map;
  return { ...map, [msg.roomId]: [...list, msg] };
}

/** 최근 메시지 순 정렬 (서버 getMyRooms 규칙: 최신 우선, 없으면 뒤로). */
function sortByRecent(rooms: RoomSummary[]): RoomSummary[] {
  return [...rooms].sort((a, b) => {
    if (!a.lastMessageAt && !b.lastMessageAt) return 0;
    if (!a.lastMessageAt) return 1;
    if (!b.lastMessageAt) return -1;
    return b.lastMessageAt.localeCompare(a.lastMessageAt); // ISO 문자열 = 시간순
  });
}

/**
 * 새 메시지가 온 방 하나만 증분 갱신(lastMessage/unread) 후 재정렬.
 * 메시지마다 GET /api/rooms 전체 재조회를 없애 수용량을 크게 올린다.
 */
function bumpRoom(rooms: RoomSummary[], msg: ChatMessage, isActive: boolean): RoomSummary[] {
  const updated = rooms.map((r) =>
    r.id === msg.roomId
      ? {
          ...r,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: isActive ? 0 : r.unreadCount + 1,
        }
      : r,
  );
  return sortByRecent(updated);
}

export const useApp = create<AppState>((set, get) => ({
  token: null,
  me: null,
  rooms: [],
  friends: [],
  activeRoomId: null,
  messagesByRoom: {},
  loadedRooms: new Set(),
  hasMoreByRoom: {},
  socket: null,

  bootstrapFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const meRaw = localStorage.getItem(ME_KEY);
    if (!token || !meRaw) return;
    const me = JSON.parse(meRaw) as Me;
    setAccessToken(token);
    set({ token, me });
    // 서버에서 최신 프로필(tag 등) 동기화. 토큰이 무효하면 자동 로그아웃.
    userApi
      .me()
      .then((fresh) => {
        const synced: Me = { userId: fresh.userId, displayName: fresh.displayName, tag: fresh.tag };
        localStorage.setItem(ME_KEY, JSON.stringify(synced));
        set({ me: synced });
        get().connect();
        void get().loadRooms();
        void get().loadFriends();
      })
      .catch(() => get().logout());
  },

  login: (token, me) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ME_KEY, JSON.stringify(me));
    setAccessToken(token);
    set({ token, me });
    get().connect();
    void get().loadRooms();
    void get().loadFriends();
  },

  logout: () => {
    get().socket?.deactivate();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ME_KEY);
    setAccessToken(null);
    set({
      token: null,
      me: null,
      rooms: [],
      friends: [],
      activeRoomId: null,
      messagesByRoom: {},
      loadedRooms: new Set(),
      hasMoreByRoom: {},
      socket: null,
    });
  },

  connect: () => {
    const { token, socket } = get();
    if (!token || socket) return;
    const s = new ChatSocket(token, () => {
      get().rooms.forEach((r) => get().socket?.subscribeRoom(r.id, onIncoming(set, get)));
      // 새 방 생성/초대 시 개인 큐로 알림 받으면 목록 갱신 (새로고침 불필요)
      get().socket?.subscribeUserQueue(() => void get().loadRooms());
    });
    s.activate();
    set({ socket: s });
  },

  loadRooms: async () => {
    const rooms = await roomApi.list();
    set({ rooms });
    const s = get().socket;
    if (s?.connected) rooms.forEach((r) => s.subscribeRoom(r.id, onIncoming(set, get)));
  },

  loadFriends: async () => {
    set({ friends: await friendApi.list() });
  },

  selectRoom: async (roomId) => {
    set({ activeRoomId: roomId });
    if (!get().loadedRooms.has(roomId)) {
      const page = await messageApi.history(roomId);
      set((st) => ({
        messagesByRoom: { ...st.messagesByRoom, [roomId]: page.content },
        loadedRooms: new Set(st.loadedRooms).add(roomId),
        hasMoreByRoom: { ...st.hasMoreByRoom, [roomId]: page.hasNext },
      }));
    }
    get().socket?.subscribeRoom(roomId, onIncoming(set, get));

    // 방을 여는 즉시 배지 제거(낙관적) → 서버 읽음 갱신 → 목록 재조회로 동기화
    set((st) => ({
      rooms: st.rooms.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r)),
    }));
    const list = get().messagesByRoom[roomId] ?? [];
    const last = list[list.length - 1];
    if (last) {
      // 배지는 위에서 이미 0으로(낙관적), 서버에만 읽음 반영 — 전체 재조회 안 함
      void messageApi.markRead(roomId, last.id);
    }
  },

  loadOlder: async (roomId) => {
    if (!get().hasMoreByRoom[roomId]) return;
    const list = get().messagesByRoom[roomId] ?? [];
    const cursor = list[0]?.id; // 현재 가장 오래된 메시지 = 다음 커서
    if (!cursor) return;
    const page = await messageApi.history(roomId, cursor);
    set((st) => {
      const existing = st.messagesByRoom[roomId] ?? [];
      const seen = new Set(existing.map((m) => m.id));
      const older = page.content.filter((m) => !seen.has(m.id));
      return {
        messagesByRoom: { ...st.messagesByRoom, [roomId]: [...older, ...existing] },
        hasMoreByRoom: { ...st.hasMoreByRoom, [roomId]: page.hasNext },
      };
    });
  },

  sendMessage: (text) => {
    const { socket, activeRoomId } = get();
    if (!socket || activeRoomId == null || !text.trim()) return;
    socket.send(activeRoomId, text.trim());
  },

  addFriend: async (handle) => {
    await friendApi.add(handle);
    await get().loadFriends();
  },

  addFriendByUser: async (userId) => {
    await friendApi.addByUser(userId);
    await get().loadFriends();
    await get().loadRooms(); // 멤버의 친구여부/태그 표시 갱신
  },

  removeFriend: async (friendId) => {
    await friendApi.remove(friendId);
    await get().loadFriends();
  },

  openDirectWith: async (userId) => {
    const room = await roomApi.create('DIRECT', [userId]); // 서버가 기존 방 있으면 재사용
    await get().createRoomAndOpen(room);
  },

  createRoomAndOpen: async (room) => {
    await get().loadRooms();
    get().socket?.subscribeRoom(room.id, onIncoming(set, get));
    await get().selectRoom(room.id);
  },

  updateProfile: async (displayName) => {
    const updated = await userApi.updateProfile(displayName);
    const me: Me = { userId: updated.userId, displayName: updated.displayName, tag: updated.tag };
    localStorage.setItem(ME_KEY, JSON.stringify(me));
    set({ me });
    await get().loadRooms();
  },

  inviteToRoom: async (roomId, memberIds) => {
    await roomApi.invite(roomId, memberIds);
    await get().loadRooms();
  },

  leaveRoom: async (roomId) => {
    await roomApi.leave(roomId);
    // 캐시 비우기 — 나중에 재등장(상대가 메시지)하면 히스토리를 새로 불러오도록
    set((st) => {
      const loadedRooms = new Set(st.loadedRooms);
      loadedRooms.delete(roomId);
      const messagesByRoom = { ...st.messagesByRoom };
      delete messagesByRoom[roomId];
      const hasMoreByRoom = { ...st.hasMoreByRoom };
      delete hasMoreByRoom[roomId];
      return {
        activeRoomId: st.activeRoomId === roomId ? null : st.activeRoomId,
        loadedRooms,
        messagesByRoom,
        hasMoreByRoom,
      };
    });
    await get().loadRooms();
  },

  renameRoom: async (roomId, title) => {
    await roomApi.rename(roomId, title);
    await get().loadRooms();
  },
}));

function onIncoming(
  set: (fn: (s: AppState) => Partial<AppState>) => void,
  get: () => AppState,
) {
  return (msg: ChatMessage) => {
    // 모르는 방(새로 초대된 방 등)일 때만 전체 목록 재조회 — 드문 경우만 fallback
    if (!get().rooms.some((r) => r.id === msg.roomId)) {
      void get().loadRooms();
      return;
    }
    const isActive = get().activeRoomId === msg.roomId;
    set((st) => ({
      // 히스토리를 불러온 방에만 실시간 메시지 끼워넣기 (부분표시 버그 방지)
      ...(st.loadedRooms.has(msg.roomId)
        ? { messagesByRoom: appendMessage(st.messagesByRoom, msg) }
        : {}),
      // 해당 방만 증분 갱신 (전체 loadRooms 제거 → 수용량 ↑)
      rooms: bumpRoom(st.rooms, msg, isActive),
    }));
    // 보고 있는 방이면 서버 읽음 처리(목록 재조회 없이)
    if (isActive) {
      void messageApi.markRead(msg.roomId, msg.id);
    }
    // 시스템 메시지(입장/퇴장)는 멤버 구성이 바뀐 것 → 목록/멤버 새로고침
    if (msg.type === 'SYSTEM') {
      void get().loadRooms();
    }
  };
}
