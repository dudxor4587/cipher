import { useEffect, useState } from 'react';
import { setFavicon } from './core/favicon';
import { useApp } from './core/store';
import { LoginPage } from './features/auth/LoginPage';
import { ChatPage } from './features/chat/ChatPage';
import { getTheme, loadDarkMode, loadThemeKey, saveDarkMode } from './themes/registry';

export default function App() {
  const token = useApp((s) => s.token);
  const bootstrap = useApp((s) => s.bootstrapFromStorage);
  const [themeKey, setThemeKey] = useState(loadThemeKey());
  const [darkMode, setDarkMode] = useState(loadDarkMode());

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // 로그인 전(공개 화면)은 중립 'cipher'(자물쇠) — 브랜드 노출 없음.
  // 로그인 후에만 테마 브랜드로 위장(파비콘·탭 제목).
  useEffect(() => {
    if (token) {
      setFavicon(themeKey);
      document.title = getTheme(themeKey).label;
    } else {
      setFavicon('cipher');
      document.title = 'cipher';
    }
  }, [token, themeKey]);

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev;
      saveDarkMode(next);
      return next;
    });
  };

  if (!token) return <LoginPage />;
  return (
    <ChatPage
      themeKey={themeKey}
      onChangeTheme={setThemeKey}
      darkMode={darkMode}
      onToggleDark={toggleDark}
    />
  );
}
