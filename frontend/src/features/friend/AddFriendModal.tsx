import { useState } from 'react';
import { useApp } from '../../core/store';
import '../chat/newchat.css';

export function AddFriendModal({ onClose }: { onClose: () => void }) {
  const me = useApp((s) => s.me)!;
  const addFriend = useApp((s) => s.addFriend);
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!handle.trim()) return;
    setError(null);
    setBusy(true);
    try {
      await addFriend(handle.trim());
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '친구 추가에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>친구 추가</h3>
        <p className="hint">상대의 핸들(이름#태그)을 입력하세요.</p>
        <label>친구 핸들</label>
        <input
          className="field"
          placeholder="예: 앨리스#0042"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') submit();
          }}
          autoFocus
        />
        <p className="hint">
          내 핸들: <b>{me.displayName}#{me.tag}</b> (친구에게 알려주세요)
        </p>
        {error && <div className="error">{error}</div>}
        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button className="primary" onClick={submit} disabled={busy || !handle.trim()}>
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
