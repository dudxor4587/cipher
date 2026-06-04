import type { FC } from 'react';
import type { ChatMessage, Me, RoomSummary, UserSummary } from '../core/types';

export type SidebarTab = 'chats' | 'friends';

/** 컨테이너(ChatPage)가 테마 레이아웃에 넘기는, 테마와 무관한 데이터/콜백. */
export interface ThemeProps {
  me: Me;
  rooms: RoomSummary[];
  friends: UserSummary[];
  activeRoomId: string | null;
  messages: ChatMessage[];
  /** 활성 방의 히스토리를 아직 불러오는 중인지 (true 면 초기화면 깜빡임 방지를 위해 빈 상태를 숨김) */
  messagesLoading: boolean;
  sidebarTab: SidebarTab;
  themeKey: string;
  themeOptions: { key: string; label: string }[];
  darkMode: boolean;
  totalUnread: number;

  onChangeTab: (tab: SidebarTab) => void;
  onSelectRoom: (roomId: string) => void;
  onSend: (text: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
  onChangeTheme: (key: string) => void;
  onToggleDark: () => void;

  onOpenFriendChat: (userId: string) => void;
  onAddFriend: () => void;
  onRemoveFriend: (friendId: string) => void;
  onOpenProfile: () => void;
  onManageRoom: () => void;
}

/**
 * 각 AI 서비스 위장 테마. 위장의 핵심은 동일한 데이터(ThemeProps)를
 * 테마마다 다르게 렌더링하는 것. 새 테마 추가 = ChatTheme 하나 구현.
 */
export interface ChatTheme {
  key: string;
  label: string;
  Layout: FC<ThemeProps>;
}
