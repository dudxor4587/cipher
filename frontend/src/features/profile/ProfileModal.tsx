import { useState } from 'react';
import { disablePush, enablePush, pushEnabled, pushSupported } from '../../core/push';
import { useApp } from '../../core/store';
import '../chat/newchat.css';

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const me = useApp((s) => s.me)!;
  const friends = useApp((s) => s.friends);
  const updateProfile = useApp((s) => s.updateProfile);
  const logout = useApp((s) => s.logout);

  const [displayName, setDisplayName] = useState(me.displayName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notify, setNotify] = useState(pushEnabled());
  const [notifyBusy, setNotifyBusy] = useState(false);

  void friends;

  const toggleNotify = async () => {
    setError(null);
    setNotifyBusy(true);
    try {
      if (notify) {
        await disablePush();
        setNotify(false);
      } else {
        await enablePush();
        setNotify(true);
      }
    } catch (e: any) {
      setError(e?.message ?? '알림 설정에 실패했습니다.');
    } finally {
      setNotifyBusy(false);
    }
  };

  const save = async () => {
    setError(null);
    setBusy(true);
    try {
      await updateProfile(displayName.trim() || me.displayName);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>내 프로필</h3>
        <p className="hint">
          내 핸들: <b>{me.displayName}#{me.tag}</b>
        </p>
        <label>표시 이름</label>
        <input
          className="field"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={30}
        />
        <p className="hint">이름을 바꾸면 태그(#숫자)가 새로 부여될 수 있습니다.</p>

        {pushSupported() && (
          <div className="toggle-row">
            <span>알림</span>
            <button
              type="button"
              className={`toggle${notify ? ' on' : ''}`}
              onClick={toggleNotify}
              disabled={notifyBusy}
              aria-pressed={notify}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        )}

        {error && <div className="error">{error}</div>}
        <div className="modal-actions">
          <button className="danger-btn" onClick={logout}>
            로그아웃
          </button>
          <span style={{ flex: 1 }} />
          <button onClick={onClose}>취소</button>
          <button className="primary" onClick={save} disabled={busy}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
