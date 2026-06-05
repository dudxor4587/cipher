import { useState } from 'react';
import type { ChatMessage } from '../../core/types';
import { GeminiIcon } from '../icons';
import { roomDisplayName } from '../roomName';
import { msgTime } from '../time';
import type { ChatTheme, ThemeProps } from '../types';
import { VirtualMessageList } from '../VirtualMessageList';
import './gemini.css';

/* ─────────────────────────  inline icons (Gemini action row)  ───────────────────────── */
type IconProps = { size?: number };

const HamburgerIcon = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PencilIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M13.5 6.5 17.5 10.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const ChatBubbleIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 4V6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const PeopleIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6M17 14c2.5.4 4 2.4 4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CopyIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const ThumbUpIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M7 10v10H4V10h3Zm0 0 4.5-7c1.2 0 2 1 1.7 2.2L12.5 9H18a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 17 19H7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const ThumbDownIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M17 14V4h3v10h-3Zm0 0-4.5 7c-1.2 0-2-1-1.7-2.2L11.5 15H6a2 2 0 0 1-2-2.3l1-6A2 2 0 0 1 7 5h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const ShareIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="6" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="18" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    <path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const RegenerateIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M20 4v4h-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MoreIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

const MicIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const SendArrowIcon = ({ size = 20 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 20V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ─────────────────────────  message  ───────────────────────── */
const stop = (e: React.MouseEvent) => e.stopPropagation();

function GeminiMessage({
  message,
  mine,
  showSender,
}: {
  message: ChatMessage;
  mine: boolean;
  showSender: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (message.type === 'SYSTEM') {
    return <div className="gm-msg-system">{message.content}</div>;
  }

  if (mine) {
    return (
      <div className="gm-msg gm-msg-mine">
        <div className="gm-bubble">{message.content}</div>
        <span className="gm-time">{msgTime(message.createdAt)}</span>
      </div>
    );
  }

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard?.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="gm-msg gm-msg-ai">
      <span className="gm-msg-avatar">
        <GeminiIcon size={24} />
      </span>
      <div className="gm-msg-body">
        {showSender && message.senderName && (
          <div className="gm-msg-sender">{message.senderName}</div>
        )}
        <div className="gm-msg-text">{message.content}</div>
        <div className="gm-actions">
          <button className="gm-act" title={copied ? '복사됨' : '복사'} onClick={copy}>
            <CopyIcon />
          </button>
          <button className="gm-act" title="좋아요" onClick={stop}>
            <ThumbUpIcon />
          </button>
          <button className="gm-act" title="싫어요" onClick={stop}>
            <ThumbDownIcon />
          </button>
          <button className="gm-act" title="공유 및 내보내기" onClick={stop}>
            <ShareIcon />
          </button>
          <button className="gm-act" title="답변 다시 생성" onClick={stop}>
            <RegenerateIcon />
          </button>
          <button className="gm-act" title="더보기" onClick={stop}>
            <MoreIcon />
          </button>
        </div>
        <span className="gm-time">{msgTime(message.createdAt)}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────  layout  ───────────────────────── */
function GeminiLayout(props: ThemeProps) {
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
    totalUnread,
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

  const [draft, setDraft] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  const isGroup = activeRoom?.type === 'GROUP';

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const initial = me.displayName.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className={`gm-root theme-gemini${darkMode ? ' dark' : ''}${collapsed ? ' gm-collapsed' : ''}`}>
      <aside className="gm-sidebar">
        <div className="gm-side-top">
          <button
            className="gm-rail-btn"
            title="메뉴"
            onClick={() => setCollapsed((c) => !c)}
          >
            <HamburgerIcon />
          </button>

          <button className="gm-newchat" onClick={onNewChat} title="새 채팅">
            <PencilIcon />
            <span className="gm-label">새 채팅</span>
          </button>
        </div>

        <div className="gm-tabs">
          <button
            className={`gm-tab${sidebarTab === 'chats' ? ' active' : ''}`}
            onClick={() => onChangeTab('chats')}
            title="채팅"
          >
            <ChatBubbleIcon />
            <span className="gm-label">채팅</span>
            {totalUnread > 0 && <span className="gm-unread" />}
          </button>
          <button
            className={`gm-tab${sidebarTab === 'friends' ? ' active' : ''}`}
            onClick={() => onChangeTab('friends')}
            title="Gems"
          >
            <PeopleIcon />
            <span className="gm-label">Gems</span>
          </button>
        </div>

        <div className="gm-side-scroll">
          {sidebarTab === 'chats' ? (
            <>
              <div className="gm-section-head gm-label">최근</div>
              <nav className="gm-list">
                {rooms.length === 0 && (
                  <div className="gm-empty-list gm-label">최근 채팅이 없어요</div>
                )}
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    className={`gm-item${room.id === activeRoomId ? ' active' : ''}`}
                    onClick={() => onSelectRoom(room.id)}
                    title={roomDisplayName(room, me)}
                  >
                    <ChatBubbleIcon size={18} />
                    <span className="gm-item-main gm-label">
                      <span className="gm-item-title">{roomDisplayName(room, me)}</span>
                      {room.lastMessage && (
                        <span className="gm-item-preview">{room.lastMessage}</span>
                      )}
                    </span>
                    {room.unreadCount > 0 && <span className="gm-unread" />}
                  </button>
                ))}
              </nav>
            </>
          ) : (
            <>
              <button className="gm-add-friend gm-label" onClick={onAddFriend}>
                <span className="gm-plus">+</span> 친구 추가
              </button>
              <nav className="gm-list">
                {friends.length === 0 && (
                  <div className="gm-empty-list gm-label">아직 친구가 없어요</div>
                )}
                {friends.map((f) => (
                  <div
                    key={f.userId}
                    className="gm-friend"
                    onClick={() => onOpenFriendChat(f.userId)}
                    title={`${f.displayName}#${f.tag}`}
                  >
                    <span className="gm-friend-av">
                      {f.displayName.trim().charAt(0).toUpperCase() || '?'}
                    </span>
                    <span className="gm-friend-meta gm-label">
                      <span className="gm-friend-name">
                        {f.displayName}
                        <small>#{f.tag}</small>
                      </span>
                    </span>
                    <button
                      className="gm-friend-x gm-label"
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
              </nav>
            </>
          )}
        </div>

        <div className="gm-side-footer">
          <button className="gm-profile" onClick={onOpenProfile} title={`${me.displayName}#${me.tag}`}>
            <span className="gm-profile-av">{initial}</span>
            <span className="gm-profile-meta gm-label">
              {me.displayName}
              <small>#{me.tag}</small>
            </span>
          </button>
          <div className="gm-footer-row gm-label">
            <select
              className="gm-theme-select"
              value={themeKey}
              onChange={(e) => onChangeTheme(e.target.value)}
            >
              {themeOptions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              className="gm-icon-btn"
              onClick={onToggleDark}
              title={darkMode ? '라이트 모드' : '다크 모드'}
            >
              {darkMode ? '☀' : '☾'}
            </button>
            <button className="gm-icon-btn" onClick={onLogout} title="로그아웃">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      <main className="gm-main">
        <header className="gm-header">
          {activeRoom ? (
            <span className="gm-room-name">{roomDisplayName(activeRoom, me)}</span>
          ) : (
            <button className="gm-model" type="button">
              <span className="gm-wordmark">Gemini</span>
              <span className="gm-caret">▾</span>
            </button>
          )}
          {activeRoom && (
            <button className="gm-manage" onClick={onManageRoom} title="대화 관리">
              <MoreIcon size={20} />
            </button>
          )}
        </header>

        {activeRoom && messages.length > 0 ? (
          <VirtualMessageList
            className="gm-scroll"
            messages={messages}
            activeRoomId={activeRoomId}
            gap={28}
            estimate={76}
            maxWidth={760}
            renderItem={(m) => (
              <GeminiMessage
                message={m}
                mine={m.senderId === me.userId}
                showSender={isGroup}
              />
            )}
          />
        ) : (
          <div className="gm-scroll">
            {!messagesLoading && (
              <div className="gm-empty">
                <h1 className="gm-greeting">안녕하세요</h1>
                <p className="gm-greeting-sub">무엇을 도와드릴까요?</p>
              </div>
            )}
          </div>
        )}

        {activeRoom && (
          <div className="gm-composer-wrap">
            <div className="gm-composer">
              <button className="gm-comp-plus" title="추가" type="button">
                +
              </button>
              <textarea
                className="gm-comp-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Gemini에게 물어보기"
                rows={1}
              />
              <button className="gm-comp-mic" title="음성 입력" type="button">
                <MicIcon />
              </button>
              <button
                className="gm-comp-send"
                onClick={submit}
                aria-label="전송"
                disabled={!draft.trim()}
              >
                <SendArrowIcon />
              </button>
            </div>
            <div className="gm-disclaimer">Gemini는 부정확한 정보를 표시할 수 있습니다.</div>
          </div>
        )}
      </main>
    </div>
  );
}

export const geminiTheme: ChatTheme = { key: 'gemini', label: 'Gemini', Layout: GeminiLayout };
