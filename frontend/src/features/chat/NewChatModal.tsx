import { useState } from 'react';
import { roomApi } from '../../core/api';
import { useApp } from '../../core/store';
import type { RoomSummary } from '../../core/types';
import './newchat.css';

/**
 * 새 대화는 "친구" 중에서만 시작한다. (전역 유저 검색 폐지 — 스팸/수집 방지)
 * 1명 선택 → 1:1, 2명+ → 단체.
 */
export function NewChatModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (room: RoomSummary) => void;
}) {
  const friends = useApp((s) => s.friends);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const create = async () => {
    if (selected.length === 0) return;
    setBusy(true);
    try {
      const isGroup = selected.length > 1;
      const room = await roomApi.create(
        isGroup ? 'GROUP' : 'DIRECT',
        selected,
        isGroup ? title || null : null,
      );
      onCreated(room);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>새 대화 시작</h3>

        {friends.length === 0 ? (
          <p className="hint">
            먼저 <b>친구 탭 → 친구 추가</b>에서 상대의 핸들(이름#태그)로 친구를 추가하세요.
          </p>
        ) : (
          <>
            <p className="hint">대화할 친구를 선택하세요. (여러 명 = 단체 대화)</p>
            <ul className="member-list">
              {friends.map((f) => (
                <li key={f.userId} onClick={() => toggle(f.userId)} style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={selected.includes(f.userId)} readOnly />
                  {f.displayName}
                  <small style={{ color: '#999' }}>#{f.tag}</small>
                </li>
              ))}
            </ul>
            {selected.length > 1 && (
              <input
                className="field"
                placeholder="단체방 이름 (선택)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            )}
          </>
        )}

        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button className="primary" onClick={create} disabled={busy || selected.length === 0}>
            {selected.length > 1 ? '단체 대화 시작' : '대화 시작'}
          </button>
        </div>
      </div>
    </div>
  );
}
