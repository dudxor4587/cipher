export type RoomType = 'DIRECT' | 'GROUP';

// id 는 모두 UUID 문자열
export interface Me {
  userId: string;
  displayName: string;
  tag: string;
}

/** 친구/프로필 공통 유저 표현. handle = 이름#태그 */
export interface UserSummary {
  userId: string;
  displayName: string;
  tag: string;
  handle: string;
}

/** 방 멤버를 조회자 기준으로 표현. 친구/본인 아니면 tag=null(가림). */
export interface RoomMemberView {
  userId: string;
  displayName: string;
  tag: string | null;
  friend: boolean;
  me: boolean;
}

export interface RoomSummary {
  id: string;
  type: RoomType;
  title: string | null;
  members: RoomMemberView[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string | null;   // SYSTEM 메시지는 발신자 없음
  senderName: string | null;
  content: string;
  createdAt: string;
  type: 'CHAT' | 'SYSTEM';
}

/** 커서 기반 페이지 응답 (백엔드 CursorPage 대응). nextCursor = 이번 페이지 가장 오래된 항목 id. */
export interface CursorPage<T> {
  content: T[];
  hasNext: boolean;
  nextCursor: string | null;
}

export interface AuthResult {
  accessToken: string;
  userId: string;
  displayName: string;
  tag: string;
}
