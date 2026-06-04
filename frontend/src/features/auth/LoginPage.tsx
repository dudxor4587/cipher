import { useState } from 'react';
import { authApi } from '../../core/api';
import { useApp } from '../../core/store';
import './login.css';

export function LoginPage() {
  const login = useApp((s) => s.login);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setBusy(true);
    try {
      const result =
        mode === 'login'
          ? await authApi.login(loginId, password)
          : await authApi.signup(loginId, password, displayName);
      login(result.accessToken, {
        userId: result.userId,
        displayName: result.displayName,
        tag: result.tag,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? '요청에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>cipher</h1>
        <p className="login-sub">{mode === 'login' ? '로그인' : '회원가입'}</p>
        <input
          placeholder="아이디"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          autoComplete="username"
        />
        {mode === 'signup' && (
          <input
            placeholder="표시 이름"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {mode === 'signup' && (
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            autoComplete="new-password"
          />
        )}
        {error && <div className="login-error">{error}</div>}
        <button type="submit" disabled={busy}>
          {busy ? '...' : mode === 'login' ? '로그인' : '가입하기'}
        </button>
        <button
          type="button"
          className="login-switch"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError(null);
            setPasswordConfirm('');
          }}
        >
          {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </form>
    </div>
  );
}
