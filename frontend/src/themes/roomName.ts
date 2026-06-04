import type { Me, RoomSummary } from '../core/types';

/** 방 표시 이름: title 우선, 없으면 상대 멤버 이름들로 구성. */
export function roomDisplayName(room: RoomSummary, me: Me): string {
  if (room.title && room.title.trim()) return room.title;
  const others = room.members.filter((m) => m.userId !== me.userId);
  if (others.length === 0) return '나와의 채팅';
  return others.map((m) => m.displayName).join(', ');
}
