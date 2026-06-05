import { useState } from 'react';
import type { FC } from 'react';
import type { ChatMessage, UserSummary } from '../../core/types';
import { GptIcon } from '../icons';
import { roomDisplayName } from '../roomName';
import { msgTime } from '../time';
import type { ChatTheme, ThemeProps } from '../types';
import { VirtualMessageList } from '../VirtualMessageList';
import './gpt.css';

/* ---------------------------------------------------------------- icons --- */
/* Lucide-style 1.75 stroke inline SVGs. currentColor 로 라이트/다크 적응. */

type IconProps = { size?: number };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function PanelIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="9" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function PencilIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function PlusIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ChevronDownIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DotsIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function SunIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function LogoutIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function CopyIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ThumbUpIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M7 10v11" />
      <path d="M14 4.5 13 9h6.3a2 2 0 0 1 2 2.3l-1.3 7a2 2 0 0 1-2 1.7H7V10l3-1 2-4.8A1.5 1.5 0 0 1 14 4.5Z" />
    </svg>
  );
}

function ThumbDownIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M17 14V3" />
      <path d="M10 19.5 11 15H4.7a2 2 0 0 1-2-2.3l1.3-7A2 2 0 0 1 6 4h11v10l-3 1-2 4.8A1.5 1.5 0 0 1 10 19.5Z" />
    </svg>
  );
}

function SpeakerIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function RegenerateIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <polyline points="21 4 21 8 17 8" />
    </svg>
  );
}

function MicIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

function ArrowUpIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} aria-hidden>
      <line x1="12" y1="20" x2="12" y2="5" />
      <polyline points="6 11 12 5 18 11" />
    </svg>
  );
}

/** OpenAI 매듭 근사 브랜드 마크 (사이드바 토글/엠티 화면용). */
function BrandMark({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2c1.8 0 3.4 1 4.2 2.5 1.7.1 3.2 1.2 3.9 2.8.7 1.6.4 3.4-.6 4.7.5 1.6.1 3.4-1.1 4.6-1.2 1.2-3 1.6-4.6 1.1-1 1-2.4 1.5-3.8 1.3-1.8-.2-3.3-1.3-4-2.9-1.6-.2-3-1.3-3.6-2.8-.6-1.6-.3-3.3.8-4.6-.5-1.6 0-3.4 1.2-4.5C5.6 4 7.2 3.6 8.8 4c.8-.5 1.9-.8 3.2-.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" />
    </svg>
  );
}

/* -------------------------------------------------------------- helpers --- */

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/* ---------------------------------------------------------- assistant ---- */
/* 어시스턴트 메시지 하단 액션 툴바 (hover 시 노출). Copy 만 실제 동작. */

function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard?.writeText(content).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => undefined,
    );
  };

  const noop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="gpt-actions">
      <button className="gpt-action" title={copied ? '복사됨' : '복사'} onClick={copy}>
        <CopyIcon />
      </button>
      <button className="gpt-action" title="좋아요" onClick={noop}>
        <ThumbUpIcon />
      </button>
      <button className="gpt-action" title="싫어요" onClick={noop}>
        <ThumbDownIcon />
      </button>
      <button className="gpt-action" title="읽어주기" onClick={noop}>
        <SpeakerIcon />
      </button>
      <button className="gpt-action" title="다시 생성" onClick={noop}>
        <RegenerateIcon />
      </button>
    </div>
  );
}

function GptMessage({
  message,
  mine,
  showSender,
}: {
  message: ChatMessage;
  mine: boolean;
  showSender: boolean;
}) {
  if (message.type === 'SYSTEM') {
    return <div className="gpt-system">{message.content}</div>;
  }

  if (mine) {
    return (
      <div className="gpt-turn gpt-turn-user">
        <div className="gpt-user-bubble">{message.content}</div>
        <span className="gpt-time">{msgTime(message.createdAt)}</span>
      </div>
    );
  }

  return (
    <div className="gpt-turn gpt-turn-assistant">
      <span className="gpt-msg-logo">
        <GptIcon size={22} />
      </span>
      <div className="gpt-assistant-body">
        {showSender && message.senderName && (
          <div className="gpt-sender">{message.senderName}</div>
        )}
        <div className="gpt-assistant-text">{message.content}</div>
        <MessageActions content={message.content} />
        <span className="gpt-time">{msgTime(message.createdAt)}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- sidebar ------ */

function FriendRow({
  friend,
  onChat,
  onRemove,
}: {
  friend: UserSummary;
  onChat: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="gpt-friend" onClick={onChat}>
      <span className="gpt-avatar gpt-avatar-sm">{initials(friend.displayName)}</span>
      <span className="gpt-friend-meta">
        <span className="gpt-friend-name">
          {friend.displayName}
          <small>#{friend.tag}</small>
        </span>
      </span>
      <button
        className="gpt-friend-remove"
        title="친구 삭제"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* ---------------------------------------------------------- layout ------- */

const GptLayout: FC<ThemeProps> = (props) => {
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

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  const isGroup = activeRoom?.type === 'GROUP';

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중 Enter(keyCode 229) 무시 → 한글 중복 전송 방지
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={`gpt-root${collapsed ? ' collapsed' : ''}`}>
      {/* 사이드바 접힘 시 좌상단 고정 컨트롤 */}
      {collapsed && (
        <div className="gpt-rail">
          <button
            className="gpt-iconbtn"
            title="사이드바 열기"
            onClick={() => setCollapsed(false)}
          >
            <PanelIcon />
          </button>
          <button className="gpt-iconbtn" title="새 채팅" onClick={onNewChat}>
            <PencilIcon />
          </button>
        </div>
      )}

      <aside className="gpt-sidebar">
        <div className="gpt-sidebar-top">
          <button
            className="gpt-iconbtn"
            title="사이드바 닫기"
            onClick={() => setCollapsed(true)}
          >
            <PanelIcon />
          </button>
          <button className="gpt-iconbtn" title="새 채팅" onClick={onNewChat}>
            <PencilIcon />
          </button>
        </div>

        <div className="gpt-tabs">
          <button
            className={`gpt-tab${sidebarTab === 'chats' ? ' active' : ''}`}
            onClick={() => onChangeTab('chats')}
          >
            채팅
          </button>
          <button
            className={`gpt-tab${sidebarTab === 'friends' ? ' active' : ''}`}
            onClick={() => onChangeTab('friends')}
          >
            보관함
          </button>
        </div>

        <nav className="gpt-list">
          {sidebarTab === 'chats' ? (
            rooms.length === 0 ? (
              <div className="gpt-list-empty">대화가 없어요</div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  className={`gpt-room${room.id === activeRoomId ? ' active' : ''}`}
                  onClick={() => onSelectRoom(room.id)}
                >
                  <span className="gpt-room-title">{roomDisplayName(room, me)}</span>
                  {room.unreadCount > 0 && <span className="gpt-unread" />}
                </button>
              ))
            )
          ) : (
            <>
              <button className="gpt-add-friend" onClick={onAddFriend}>
                <PlusIcon size={16} />
                친구 추가
              </button>
              {friends.length === 0 ? (
                <div className="gpt-list-empty">아직 친구가 없어요</div>
              ) : (
                friends.map((f) => (
                  <FriendRow
                    key={f.userId}
                    friend={f}
                    onChat={() => onOpenFriendChat(f.userId)}
                    onRemove={() => onRemoveFriend(f.userId)}
                  />
                ))
              )}
            </>
          )}
        </nav>

        <div className="gpt-sidebar-footer">
          <button className="gpt-profile" onClick={onOpenProfile}>
            <span className="gpt-avatar gpt-avatar-sm">{initials(me.displayName)}</span>
            <span className="gpt-profile-name">
              {me.displayName}
              <small>#{me.tag}</small>
            </span>
          </button>
          <div className="gpt-footer-row">
            <select
              className="gpt-theme-select"
              value={themeKey}
              onChange={(e) => onChangeTheme(e.target.value)}
              title="테마"
            >
              {themeOptions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              className="gpt-iconbtn"
              onClick={onToggleDark}
              title={darkMode ? '라이트 모드' : '다크 모드'}
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="gpt-iconbtn" onClick={onLogout} title="로그아웃">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      <main className="gpt-main">
        <header className="gpt-header">
          {activeRoom ? (
            <span className="gpt-room-name">{roomDisplayName(activeRoom, me)}</span>
          ) : (
            <button className="gpt-model" title="모델 선택">
              <span>ChatGPT</span>
              <ChevronDownIcon size={16} />
            </button>
          )}
          {activeRoom && (
            <button className="gpt-iconbtn gpt-manage" onClick={onManageRoom} title="대화 관리">
              <DotsIcon />
            </button>
          )}
        </header>

        {activeRoom && messages.length > 0 ? (
          <VirtualMessageList
            className="gpt-scroll"
            messages={messages}
            activeRoomId={activeRoomId}
            gap={24}
            estimate={72}
            maxWidth={768}
            renderItem={(m) => (
              <GptMessage
                message={m}
                mine={m.senderId === me.userId}
                showSender={isGroup}
              />
            )}
          />
        ) : (
          <div className="gpt-scroll">
            {!messagesLoading && (
              <div className="gpt-empty">
                <BrandMark size={44} />
                <h1>무엇을 도와드릴까요?</h1>
              </div>
            )}
          </div>
        )}

        {activeRoom && (
          <div className="gpt-composer-wrap">
            <div className="gpt-composer">
              <button className="gpt-attach" title="첨부" type="button">
                <PlusIcon size={20} />
              </button>
              <textarea
                className="gpt-textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="메시지 ChatGPT"
                rows={1}
              />
              <button className="gpt-mic" title="음성 입력" type="button">
                <MicIcon size={20} />
              </button>
              <button
                className="gpt-send"
                onClick={submit}
                aria-label="전송"
                disabled={!draft.trim()}
                type="button"
              >
                <ArrowUpIcon size={20} />
              </button>
            </div>
            <p className="gpt-disclaimer">ChatGPT는 실수를 할 수 있습니다. 중요한 정보는 확인하세요.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export const gptTheme: ChatTheme = { key: 'gpt', label: 'ChatGPT', Layout: GptLayout };
