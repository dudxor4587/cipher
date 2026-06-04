import { useEffect, useState } from 'react';
import { useApp } from './core/store';
import { LoginPage } from './features/auth/LoginPage';
import { ChatPage } from './features/chat/ChatPage';
import { loadDarkMode, loadThemeKey, saveDarkMode } from './themes/registry';

export default function App() {
  const token = useApp((s) => s.token);
  const bootstrap = useApp((s) => s.bootstrapFromStorage);
  const [themeKey, setThemeKey] = useState(loadThemeKey());
  const [darkMode, setDarkMode] = useState(loadDarkMode());

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

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
