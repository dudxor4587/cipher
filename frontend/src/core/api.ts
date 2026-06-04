import axios from 'axios';
import type {
  AuthResult,
  ChatMessage,
  CursorPage,
  RoomSummary,
  RoomType,
  UserSummary,
} from './types';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({ baseURL });

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export const authApi = {
  signup: (loginId: string, password: string, displayName: string) =>
    api.post<AuthResult>('/auth/signup', { loginId, password, displayName }).then((r) => r.data),
  login: (loginId: string, password: string) =>
    api.post<AuthResult>('/auth/login', { loginId, password }).then((r) => r.data),
};

export const userApi = {
  me: () => api.get<UserSummary>('/users/me').then((r) => r.data),
  updateProfile: (displayName: string) =>
    api.patch<UserSummary>('/users/me', { displayName }).then((r) => r.data),
};

export const friendApi = {
  list: () => api.get<UserSummary[]>('/friends').then((r) => r.data),
  add: (handle: string) => api.post<UserSummary>('/friends', { handle }).then((r) => r.data),
  addByUser: (userId: string) =>
    api.post<UserSummary>(`/friends/by-user/${userId}`).then((r) => r.data),
  remove: (friendId: string) => api.delete(`/friends/${friendId}`),
};

export const roomApi = {
  list: () => api.get<RoomSummary[]>('/rooms').then((r) => r.data),
  create: (type: RoomType, memberIds: string[], title?: string | null) =>
    api.post<RoomSummary>('/rooms', { type, memberIds, title: title ?? null }).then((r) => r.data),
  get: (roomId: string) => api.get<RoomSummary>(`/rooms/${roomId}`).then((r) => r.data),
  invite: (roomId: string, memberIds: string[]) =>
    api.post<RoomSummary>(`/rooms/${roomId}/members`, { memberIds }).then((r) => r.data),
  leave: (roomId: string) => api.delete(`/rooms/${roomId}/members/me`),
  rename: (roomId: string, title: string) =>
    api.patch<RoomSummary>(`/rooms/${roomId}`, { title }).then((r) => r.data),
};

export const messageApi = {
  history: (roomId: string, beforeId?: string, size = 40) =>
    api
      .get<CursorPage<ChatMessage>>(`/rooms/${roomId}/messages`, { params: { beforeId, size } })
      .then((r) => r.data),
  markRead: (roomId: string, lastReadMessageId: string) =>
    api.post(`/rooms/${roomId}/messages/read`, null, { params: { lastReadMessageId } }),
};
