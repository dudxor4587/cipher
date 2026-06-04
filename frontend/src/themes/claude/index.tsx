import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../core/types';
import { ClaudeIcon } from '../icons';
import { roomDisplayName } from '../roomName';
import type { ChatTheme, ThemeProps } from '../types';
import { VirtualMessageList } from '../VirtualMessageList';
import './claude.css';

/* ── 작은 아웃라인 아이콘들 (Claude.ai 액션 툴바 근사) ───────────────── */

function IconCopy({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5 15V6a2 2 0 0 1 2-2h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPlay({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6.5v11l9-5.5-9-5.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconThumbUp({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10v9H4.5A1.5 1.5 0 0 1 3 17.5v-6A1.5 1.5 0 0 1 4.5 10H7Zm0 0 4.2-6.2a1.5 1.5 0 0 1 2.6 1.1L13 10h5.4a2 2 0 0 1 1.96 2.4l-1.1 5.4A2 2 0 0 1 17.3 19H7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconThumbDown({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M17 14V5h2.5A1.5 1.5 0 0 1 21 6.5v6a1.5 1.5 0 0 1-1.5 1.5H17Zm0 0-4.2 6.2a1.5 1.5 0 0 1-2.6-1.1L11 14H5.6a2 2 0 0 1-1.96-2.4l1.1-5.4A2 2 0 0 1 6.7 5H17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRetry({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 12a8 8 0 1 1-2.3-5.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M20 4v4h-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19V6M6 12l6-6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlus({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPanel({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 4v16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/* ── 메시지 ─────────────────────────────────────────────────────────── */

function ClaudeMessage({
  message,
  mine,
  showSender,
}: {
  message: ChatMessage;
  mine: boolean;
  showSender: boolean;
}) {
  if (message.type === 'SYSTEM') {
    return <div className="cl-sys">{message.content}</div>;
  }

  if (mine) {
    return (
      <div className="cl-row cl-row-mine">
        <div className="cl-bubble">{message.content}</div>
      </div>
    );
  }

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard?.writeText(message.content);
  };
  const noop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="cl-row cl-row-claude">
      <span className="cl-msg-logo">
        <ClaudeIcon size={20} />
      </span>
      <div className="cl-claude-body">
        {showSender && message.senderName && (
          <div className="cl-sender">{message.senderName}</div>
        )}
        <div className="cl-claude-text">{message.content}</div>
        <div className="cl-actions">
        <button className="cl-act" title="복사" onClick={copy}>
          <IconCopy />
        </button>
        <button className="cl-act" title="소리내어 읽기" onClick={noop}>
          <IconPlay />
        </button>
        <button className="cl-act" title="좋아요" onClick={noop}>
          <IconThumbUp />
        </button>
        <button className="cl-act" title="싫어요" onClick={noop}>
          <IconThumbDown />
        </button>
        <button className="cl-act" title="다시 생성" onClick={noop}>
          <IconRetry />
        </button>
        </div>
      </div>
    </div>
  );
}

/* ── 레이아웃 ───────────────────────────────────────────────────────── */

function ClaudeLayout(props: ThemeProps) {
  const {
    me,
    rooms,
    friends,
    activeRoomId,
    messages,
    messagesLoading,
    sidebarTab,
    themeKey,
    themeOptions,
    darkMode,
    onChangeTab,
    onSelectRoom,
    onSend,
    onNewChat,
    onLogout,
    onChangeTheme,
    onToggleDark,
    onOpenFriendChat,
    onAddFriend,
    onRemoveFriend,
    onOpenProfile,
    onManageRoom,
  } = props;

  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  const isGroup = activeRoom?.type === 'GROUP';

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
    if (taRef.current) taRef.current.style.height = 'auto';
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // textarea 자동 높이
  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  };

  useEffect(() => {
    if (activeRoom) taRef.current?.focus();
  }, [activeRoomId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`cl-root${collapsed ? ' collapsed' : ''}`}>
      {/* 사이드바 */}
      <aside className="cl-sidebar">
        <div className="cl-side-top">
          <div className="cl-brand">
            <ClaudeIcon size={22} />
            <span className="cl-wordmark">Claude</span>
          </div>
          <button
            className="cl-iconbtn"
            title="사이드바 접기"
            onClick={() => setCollapsed(true)}
          >
            <IconPanel />
          </button>
        </div>

        <button className="cl-newchat" onClick={onNewChat}>
          <span className="cl-newchat-icon">
            <IconPlus size={16} />
          </span>
          새 채팅
        </button>

        <div className="cl-tabs">
          <button
            className={`cl-tab${sidebarTab === 'chats' ? ' active' : ''}`}
            onClick={() => onChangeTab('chats')}
          >
            채팅
          </button>
          <button
            className={`cl-tab${sidebarTab === 'friends' ? ' active' : ''}`}
            onClick={() => onChangeTab('friends')}
          >
            프로젝트
          </button>
        </div>

        <div className="cl-side-scroll">
          {sidebarTab === 'chats' ? (
            <>
              <div className="cl-section-label">최근 항목</div>
              {rooms.length === 0 && <div className="cl-empty-list">대화가 없습니다</div>}
              {rooms.map((room) => (
                <button
                  key={room.id}
                  className={`cl-roomrow${room.id === activeRoomId ? ' active' : ''}`}
                  onClick={() => onSelectRoom(room.id)}
                  title={roomDisplayName(room, me)}
                >
                  <div className="cl-roomrow-main">
                    <span className="cl-roomrow-title">{roomDisplayName(room, me)}</span>
                    {room.lastMessage && (
                      <span className="cl-roomrow-preview">{room.lastMessage}</span>
                    )}
                  </div>
                  {room.unreadCount > 0 && <span className="cl-unread" />}
                </button>
              ))}
            </>
          ) : (
            <>
              <div className="cl-section-head">
                <span className="cl-section-label">친구</span>
                <button className="cl-add" onClick={onAddFriend} title="친구 추가">
                  <IconPlus size={14} /> 추가
                </button>
              </div>
              {friends.length === 0 && <div className="cl-empty-list">친구가 없습니다</div>}
              {friends.map((f) => (
                <div
                  key={f.userId}
                  className="cl-friendrow"
                  onClick={() => onOpenFriendChat(f.userId)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cl-friend-main">
                    <span className="cl-friend-name">
                      {f.displayName}
                      <span className="cl-friend-tag">#{f.tag}</span>
                    </span>
                  </div>
                  <button
                    className="cl-remove"
                    title="친구 삭제"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFriend(f.userId);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="cl-side-footer">
          <button className="cl-profile" onClick={onOpenProfile} title="프로필">
            <span className="cl-avatar">{me.displayName.slice(0, 1)}</span>
            <span className="cl-profile-name">
              {me.displayName}
              <span className="cl-profile-tag">#{me.tag}</span>
            </span>
          </button>
          <div className="cl-footer-controls">
            <select
              className="cl-select"
              value={themeKey}
              onChange={(e) => onChangeTheme(e.target.value)}
              title="테마"
            >
              {themeOptions.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              className="cl-iconbtn"
              onClick={onToggleDark}
              title={darkMode ? '라이트 모드' : '다크 모드'}
            >
              {darkMode ? '☀' : '☾'}
            </button>
            <button className="cl-iconbtn" onClick={onLogout} title="로그아웃">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* 접혔을 때 좌상단 컨트롤 */}
      {collapsed && (
        <div className="cl-rail">
          <button
            className="cl-iconbtn"
            title="사이드바 열기"
            onClick={() => setCollapsed(false)}
          >
            <IconPanel />
          </button>
          <button className="cl-iconbtn coral" title="새 채팅" onClick={onNewChat}>
            <IconPlus />
          </button>
        </div>
      )}

      {/* 메인 */}
      <main className="cl-main">
        <header className="cl-header">
          <span className="cl-header-title">
            {activeRoom ? roomDisplayName(activeRoom, me) : 'Claude'}
          </span>
          {activeRoom && (
            <button className="cl-iconbtn" title="대화 관리" onClick={onManageRoom}>
              ⋯
            </button>
          )}
        </header>

        {activeRoom && messages.length > 0 ? (
          <VirtualMessageList
            className="cl-scroll"
            messages={messages}
            activeRoomId={activeRoomId}
            gap={24}
            estimate={72}
            maxWidth={740}
            renderItem={(m) => (
              <ClaudeMessage
                message={m}
                mine={m.senderId === me.userId}
                showSender={isGroup}
              />
            )}
          />
        ) : (
          <div className="cl-scroll cl-empty-wrap">
            {!messagesLoading && (
              <div className="cl-empty">
                <div className="cl-empty-spark">✻</div>
                <div className="cl-empty-greet">안녕하세요, 무엇을 도와드릴까요?</div>
              </div>
            )}
          </div>
        )}

        {activeRoom && (
          <div className="cl-composer-wrap">
            <div className="cl-composer">
              <textarea
                ref={taRef}
                className="cl-textarea"
                rows={1}
                placeholder="Claude에게 답장하기..."
                value={draft}
                onChange={onInput}
                onKeyDown={onKeyDown}
              />
              <button
                className="cl-send"
                onClick={submit}
                disabled={!draft.trim()}
                title="보내기"
              >
                <IconSend />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export const claudeTheme: ChatTheme = {
  key: 'claude',
  label: 'Claude',
  Layout: ClaudeLayout,
};
