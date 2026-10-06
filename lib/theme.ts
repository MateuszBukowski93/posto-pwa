import { THEME_COLORS } from './config';
import type { ThemePreference } from './domain/types';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export function isDarkPreferred(pref: ThemePreference): boolean {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

/** Ustawia data-theme na <html> i dopasowuje meta theme-color. */
export function applyTheme(pref: ThemePreference): void {
  const root = document.documentElement;
  const dark = isDarkPreferred(pref);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.style.colorScheme = dark ? 'dark' : 'light';
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    if (pref === 'system') {
      meta.content = meta.media.includes('dark') ? THEME_COLORS.dark : THEME_COLORS.light;
    } else {
      meta.content = dark ? THEME_COLORS.dark : THEME_COLORS.light;
    }
  });
}
