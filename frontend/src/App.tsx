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

  // 테마에 맞춰 파비콘 + 탭 제목 (로그인 화면 포함). 위장: 진짜 그 AI 도구처럼 보이게.
  useEffect(() => {
    setFavicon(themeKey);
    document.title = getTheme(themeKey).label;
  }, [themeKey]);

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
