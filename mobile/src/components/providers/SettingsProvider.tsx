import { useSyncExternalStore } from 'react';
import { settingsStore } from '@/lib/db/settingsStore';
import { DEFAULT_SETTINGS } from '@/lib/domain/settings';
import type { Settings } from '@/lib/domain/types';

/**
 * Ustawienia z settingsStore (wczytywane przy starcie w app/_layout.tsx, aktualizowane
 * przez repozytorium). Ekrany renderują się dopiero po wczytaniu, ale `loaded` zostaje
 * dla zgodności z wersją PWA i bezpieczeństwa.
 */
export function useSettings(): { settings: Settings; loaded: boolean } {
  const settings = useSyncExternalStore(settingsStore.subscribe, settingsStore.get, settingsStore.get);
  return { settings: settings ?? DEFAULT_SETTINGS, loaded: settings !== undefined };
}
