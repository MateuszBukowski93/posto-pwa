'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { createContext, use, useEffect, useMemo, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/config';
import { getDb } from '@/lib/db';
import { DEFAULT_SETTINGS, normalizeSettings, SETTINGS_ID } from '@/lib/domain/settings';
import type { Settings } from '@/lib/domain/types';
import { applyTheme, DARK_QUERY } from '@/lib/theme';

type SettingsContextValue = { settings: Settings; loaded: boolean };

const SettingsContext = createContext<SettingsContextValue>({ settings: DEFAULT_SETTINGS, loaded: false });

export function SettingsProvider({ children }: { children: ReactNode }) {
  // undefined = wczytywanie, null = brak zapisanych ustawień (pierwsze uruchomienie)
  const record = useLiveQuery(async () => (await getDb().settings.get(SETTINGS_ID)) ?? null, []);
  const loaded = record !== undefined;
  const settings = useMemo(() => normalizeSettings(record ?? null), [record]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.theme, settings.theme);
      localStorage.setItem(STORAGE_KEYS.locale, settings.locale);
    } catch {
      // np. tryb prywatny z zablokowanym storage – motyw i tak zadziała do przeładowania
    }
    applyTheme(settings.theme);
    if (settings.theme !== 'system') return;
    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [loaded, settings.theme, settings.locale]);

  const value = useMemo(() => ({ settings, loaded }), [settings, loaded]);
  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): SettingsContextValue {
  return use(SettingsContext);
}
