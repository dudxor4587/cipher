import { claudeTheme } from './claude';
import { cliTheme } from './cli';
import { geminiTheme } from './gemini';
import { gptTheme } from './gpt';
import type { ChatTheme } from './types';

export const themes: ChatTheme[] = [claudeTheme, gptTheme, geminiTheme, cliTheme];

export const themeOptions = themes.map((t) => ({ key: t.key, label: t.label }));

const DEFAULT_KEY = 'claude';
const THEME_KEY = 'cipher.theme';
const DARK_KEY = 'cipher.dark';

export function getTheme(key: string): ChatTheme {
  return themes.find((t) => t.key === key) ?? themes[0];
}

export function loadThemeKey(): string {
  return localStorage.getItem(THEME_KEY) ?? DEFAULT_KEY;
}

export function saveThemeKey(key: string) {
  localStorage.setItem(THEME_KEY, key);
}

export function loadDarkMode(): boolean {
  return localStorage.getItem(DARK_KEY) === '1';
}

export function saveDarkMode(dark: boolean) {
  localStorage.setItem(DARK_KEY, dark ? '1' : '0');
}
