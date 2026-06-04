import { useMemo, useState } from 'react';
import { useApp } from '../../core/store';
import type { RoomSummary } from '../../core/types';
import './newchat.css';

export function GroupManageModal({
  room,
  onClose,
}: {
  room: RoomSummary;
  onClose: () => void;
}) {
  const friends = useApp((s) => s.friends);
  const renameRoom = useApp((s) => s.renameRoom);
  const inviteToRoom = useApp((s) => s.inviteToRoom);
  const leaveRoom = useApp((s) => s.leaveRoom);
  const addFriendByUser = useApp((s) => s.addFriendByUser);

  const [title, setTitle] = useState(room.title ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const memberIds = useMemo(() => new Set(room.members.map((m) => m.userId)), [room.members]);
  const invitable = friends.filter((f) => !memberIds.has(f.userId));

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const doRename = async () => {
    setBusy(true);
    try {
      await renameRoom(room.id, title.trim());
    } finally {
      setBusy(false);
    }
  };

  const doInvite = async () => {
    if (selected.length === 0) return;
    setBusy(true);
    try {
      await inviteToRoom(room.id, selected);
      setSelected([]);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const doLeave = async () => {
    setBusy(true);
    try {
      await leaveRoom(room.id);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>대화 관리</h3>

        <label>대화방 이름</label>
        <div className="search-row">
          <input
            className="field"
            placeholder={room.type === 'GROUP' ? '단체방 이름' : '1:1 대화 (이름 선택)'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={doRename} disabled={busy}>
            변경
          </button>
        </div>

        <hr className="section-divider" />

        <label>참여자 ({room.members.length}명)</label>
        <ul className="member-list">
          {room.members.map((m) => (
            <li key={m.userId}>
              {m.displayName}
              {m.tag && <small style={{ color: '#999' }}>#{m.tag}</small>}
              {m.me && <small style={{ color: '#999' }}> (나)</small>}
              <span style={{ flex: 1 }} />
              {!m.me && !m.friend && (
                <button
                  className="add-mini"
                  onClick={() => void addFriendByUser(m.userId)}
                  title="친구 추가"
                >
                  + 친구
                </button>
              )}
            </li>
          ))}
        </ul>

        <label>친구 초대</label>
        {invitable.length === 0 ? (
          <p className="hint">초대할 수 있는 친구가 없습니다.</p>
        ) : (
          <ul className="member-list">
            {invitable.map((f) => (
              <li key={f.userId}>
                <input
                  type="checkbox"
                  checked={selected.includes(f.userId)}
                  onChange={() => toggle(f.userId)}
                />
                {f.displayName}
                <small style={{ color: '#999' }}>#{f.tag}</small>
              </li>
            ))}
          </ul>
        )}
        {room.type === 'DIRECT' && (
          <p className="hint">초대하면 단체 대화로 전환됩니다.</p>
        )}

        <div className="modal-actions">
          <button className="danger-btn" onClick={doLeave} disabled={busy}>
            나가기
          </button>
          <span style={{ flex: 1 }} />
          <button onClick={onClose}>닫기</button>
          <button
            className="primary"
            onClick={doInvite}
            disabled={busy || selected.length === 0}
          >
            초대
          </button>
        </div>
      </div>
    </div>
  );
}
