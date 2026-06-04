import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../core/store';
import { getTheme, saveThemeKey, themeOptions } from '../../themes/registry';
import type { SidebarTab } from '../../themes/types';
import { AddFriendModal } from '../friend/AddFriendModal';
import { ProfileModal } from '../profile/ProfileModal';
import { GroupManageModal } from './GroupManageModal';
import { NewChatModal } from './NewChatModal';

/** 채팅 컨테이너: 스토어 상태를 현재 테마 Layout 에 주입. 로직과 렌더링(테마)을 분리. */
export function ChatPage({
  themeKey,
  onChangeTheme,
  darkMode,
  onToggleDark,
}: {
  themeKey: string;
  onChangeTheme: (key: string) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}) {
  const me = useApp((s) => s.me)!;
  const rooms = useApp((s) => s.rooms);
  const friends = useApp((s) => s.friends);
  const activeRoomId = useApp((s) => s.activeRoomId);
  const messagesByRoom = useApp((s) => s.messagesByRoom);
  const loadedRooms = useApp((s) => s.loadedRooms);
  const selectRoom = useApp((s) => s.selectRoom);
  const sendMessage = useApp((s) => s.sendMessage);
  const logout = useApp((s) => s.logout);
  const createRoomAndOpen = useApp((s) => s.createRoomAndOpen);
  const openDirectWith = useApp((s) => s.openDirectWith);
  const removeFriend = useApp((s) => s.removeFriend);

  const [tab, setTab] = useState<SidebarTab>('chats');
  const [modal, setModal] = useState<'newchat' | 'addfriend' | 'profile' | 'manage' | null>(null);

  const Layout = getTheme(themeKey).Layout;
  const messages = activeRoomId != null ? messagesByRoom[activeRoomId] ?? [] : [];
  // 방을 선택했지만 히스토리를 아직 안 불러온 상태 → 초기화면 깜빡임 방지용
  const messagesLoading = activeRoomId != null && !loadedRooms.has(activeRoomId);
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  const totalUnread = useMemo(() => rooms.reduce((sum, r) => sum + r.unreadCount, 0), [rooms]);

  // 탭 제목은 브랜드명만 (위장 목적상 안읽음 수를 노출하지 않음)
  useEffect(() => {
    document.title = getTheme(themeKey).label;
  }, [themeKey]);

  // 테마 변수(--bg, --accent 등)를 Layout 뿐 아니라 모달까지 닿게 하려면
  // 둘 다 테마 클래스를 가진 래퍼 안에 둬야 한다 (모달이 chat-root 바깥이라서).
  const themeClass = `theme-${themeKey}${darkMode ? ' dark' : ''}`;

  return (
    <div className={themeClass}>
      <Layout
        me={me}
        rooms={rooms}
        friends={friends}
        activeRoomId={activeRoomId}
        messages={messages}
        messagesLoading={messagesLoading}
        sidebarTab={tab}
        themeKey={themeKey}
        themeOptions={themeOptions}
        darkMode={darkMode}
        totalUnread={totalUnread}
        onChangeTab={setTab}
        onSelectRoom={(id) => void selectRoom(id)}
        onSend={sendMessage}
        onNewChat={() => setModal('newchat')}
        onLogout={logout}
        onChangeTheme={(key) => {
          saveThemeKey(key);
          onChangeTheme(key);
        }}
        onToggleDark={onToggleDark}
        onOpenFriendChat={(userId) => {
          setTab('chats');
          void openDirectWith(userId);
        }}
        onAddFriend={() => setModal('addfriend')}
        onRemoveFriend={(id) => void removeFriend(id)}
        onOpenProfile={() => setModal('profile')}
        onManageRoom={() => setModal('manage')}
      />

      {modal === 'newchat' && (
        <NewChatModal
          onClose={() => setModal(null)}
          onCreated={(room) => {
            setModal(null);
            void createRoomAndOpen(room);
          }}
        />
      )}
      {modal === 'addfriend' && <AddFriendModal onClose={() => setModal(null)} />}
      {modal === 'profile' && <ProfileModal onClose={() => setModal(null)} />}
      {modal === 'manage' && activeRoom && (
        <GroupManageModal room={activeRoom} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
