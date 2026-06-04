import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../core/types';
import { roomDisplayName } from '../roomName';
import type { ChatTheme, ThemeProps } from '../types';
import { VirtualMessageList } from '../VirtualMessageList';
import './cli.css';

/** Claude Code 풍 클린 터미널 레이아웃. 내 메시지=회색 블록, 입력=블록 커서 프롬프트. */
function CliLayout(props: ThemeProps) {
  const {
    me, rooms, friends, activeRoomId, messages, messagesLoading, themeKey, themeOptions, darkMode,
    onSelectRoom, onSend, onNewChat, onLogout, onChangeTheme, onToggleDark,
    onOpenFriendChat, onAddFriend, onRemoveFriend, onOpenProfile, onManageRoom,
  } = props;

  const [draft, setDraft] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [focused, setFocused] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [loginAt] = useState(() => new Date());
  const inputRef = useRef<HTMLDivElement>(null);
  const mascot = ' ▐▛███▜▌\n▝▜█████▛▘\n  ▘▘ ▝▝';
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  const isGroup = activeRoom?.type === 'GROUP';

  // 부팅 화면 시계 (세션 없을 때만 tick)
  useEffect(() => {
    if (activeRoom) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [activeRoom]);

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
    if (inputRef.current) inputRef.current.textContent = '';
  };

  // 방 열리면 입력창에 포커스
  useEffect(() => {
    if (activeRoom) inputRef.current?.focus();
  }, [activeRoomId]); // eslint-disable-line react-hooks/exhaustive-deps

  const pad = (n: number) => String(n).padStart(2, '0');
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][loginAt.getDay()];
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][loginAt.getMonth()];
  const loginLine = `Last login: ${wd} ${mo} ${pad(loginAt.getDate())} ${pad(loginAt.getHours())}:${pad(loginAt.getMinutes())}:${pad(loginAt.getSeconds())} on ttys004`;
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div className={`cli-root${darkMode ? ' dark' : ''}`}>
      {/* 세션 탭 바 */}
      <div className="cli-tabbar">
        <button className="cli-iconbtn" onClick={() => setDrawer(true)} title="메뉴">☰</button>
        <div className="cli-tabs">
          {rooms.map((room) => (
            <button
              key={room.id}
              className={`cli-tab${room.id === activeRoomId ? ' active' : ''}`}
              onClick={() => onSelectRoom(room.id)}
              title={roomDisplayName(room, me)}
            >
              <span className="name">{roomDisplayName(room, me)}</span>
              {room.unreadCount > 0 && <span className="udot" />}
            </button>
          ))}
          <button className="cli-iconbtn newtab" onClick={onNewChat} title="새 세션">+</button>
        </div>
        {activeRoom && (
          <button className="cli-iconbtn" onClick={onManageRoom} title="대화 관리">⚙</button>
        )}
      </div>

      <main className="cli-main" onClick={() => inputRef.current?.focus()}>
        {activeRoom && messages.length > 0 ? (
          <VirtualMessageList
            className="cli-out"
            messages={messages}
            activeRoomId={activeRoomId}
            gap={8}
            estimate={40}
            renderItem={(m) => (
              <Line message={m} mine={m.senderId === me.userId} showSender={isGroup} />
            )}
          />
        ) : (
          <div className="cli-out">
            {!activeRoom && (
              <div className="cli-boot">
                <div className="cli-statline">
                  <span className="s-bat">▰ 55%</span>
                  <span className="s-cpu">CPU 18%</span>
                  <span className="s-ram">RAM 14 GB</span>
                  <span className="grow" />
                  <span className="s-net">↓ 0.0 kB ↑ 0.0 kB</span>
                </div>
                <div className="cli-login">{loginLine}</div>
                <div className="cli-pwline">
                  <span className="pseg dir">~</span>
                  <span className="cli-bootcur" />
                  <span className="grow" />
                  <span className="ok">✓</span>
                  <span className="pseg sys">system</span>
                  <span className="pseg time">{clock}</span>
                </div>
              </div>
            )}
            {activeRoom && messages.length === 0 && !messagesLoading && (
              <>
                <div className="cli-intro">
                  <pre className="cli-mascot">{mascot}</pre>
                  <div className="cli-intro-text">
                    <div className="cli-intro-title"><b>Claude Code</b> <span className="dim">v2.1.162</span></div>
                    <div className="dim">Opus 4.8 (1M context) with high effort · Claude Max</div>
                    <div className="cli-path">~/cipher</div>
                  </div>
                </div>
                <div className="cli-tip">
                  <span className="cor">Opus 4.8 is here!</span> Now defaults to high effort · /effort xhigh for your hardest tasks
                </div>
              </>
            )}
          </div>
        )}

        {activeRoom && (
          <div className="cli-composer">
            <div className="cli-box" onClick={() => inputRef.current?.focus()}>
              <span className="ps">›</span>
              <div
                ref={inputRef}
                className={`cli-edit${focused ? ' on' : ''}${draft ? ' has' : ''}`}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onInput={(e) => {
                  const el = e.currentTarget;
                  const text = el.textContent ?? '';
                  // 다 지웠을 때 브라우저가 남기는 빈 <br>/<div> 제거 → 칸이 늘어난 채 안 줄어드는 문제 방지
                  if (text === '' && el.innerHTML !== '') el.innerHTML = '';
                  setDraft(text);
                }}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
            </div>
            <div className="cli-hint">
              <span className="ae">▶▶ accept edits on</span>{' '}
              <span className="dim">(shift+tab to cycle)</span>
            </div>
          </div>
        )}
      </main>

      {/* 드로어 */}
      {drawer && <div className="cli-backdrop" onClick={() => setDrawer(false)} />}
      <aside className={`cli-drawer${drawer ? ' open' : ''}`}>
        <div className="cli-drawer-head">
          <span className="cli-brand">✻ cipher</span>
          <button className="cli-iconbtn" onClick={() => setDrawer(false)} title="닫기">✕</button>
        </div>
        <button className="cli-cmd" onClick={onAddFriend}>+ add peer</button>
        <nav className="cli-list">
          {friends.length === 0 && <div className="cli-empty">no peers</div>}
          {friends.map((f) => (
            <div
              key={f.userId}
              className="cli-friend"
              onClick={() => {
                onOpenFriendChat(f.userId);
                setDrawer(false);
              }}
            >
              <span className="dot">○</span>
              <span className="label">{f.displayName}<span className="dim">#{f.tag}</span></span>
              <button
                className="rm"
                title="삭제"
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
        <div className="cli-foot">
          <button className="cli-me" onClick={onOpenProfile}>
            {me.displayName}<span className="dim">#{me.tag}</span>
          </button>
          <div className="cli-foot-row">
            <select value={themeKey} onChange={(e) => onChangeTheme(e.target.value)}>
              {themeOptions.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
            <button onClick={onToggleDark} title="다크 토글">{darkMode ? '☀' : '☾'}</button>
            <button className="pw" onClick={onLogout} title="로그아웃">⏻</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Line({ message, mine, showSender }: { message: ChatMessage; mine: boolean; showSender: boolean }) {
  if (message.type === 'SYSTEM') {
    return (
      <div className="cli-msg system">
        <span className="gutter">⎿</span>
        <span className="text">{message.content}</span>
      </div>
    );
  }
  if (mine) {
    // 내 메시지는 회색 블록 + › (Claude CLI 식)
    return (
      <div className="cli-msg me">
        <span className="gutter">›</span>
        <span className="text">{message.content}</span>
      </div>
    );
  }
  return (
    <div className="cli-msg bot">
      <span className="gutter">●</span>
      <span className="text">
        {showSender && <span className="who">{message.senderName} </span>}
        {message.content}
      </span>
    </div>
  );
}

export const cliTheme: ChatTheme = {
  key: 'cli',
  label: 'CLI',
  Layout: CliLayout,
};
