import type { ProtocolId } from './protocols';

export type Fast = {
  id: string;
  /** epoch ms (UTC) */
  startedAt: number;
  /** brak = post trwa */
  endedAt?: number;
  /** cel w chwili startu (np. 16) */
  goalHours: number;
  protocolId: ProtocolId;
};

export type WeightEntry = { id: string; at: number; kg: number };

/** +250 ml na wpis; cofnięcie usuwa ostatni wpis z dnia. */
export type WaterEntry = { id: string; at: number; ml: number };

export const LOCALES = ['pl', 'en', 'de', 'es', 'fr', 'it', 'pt', 'uk'] as const;
export type AppLocale = (typeof LOCALES)[number];
export type LocalePreference = 'system' | AppLocale;

export type ThemePreference = 'light' | 'dark' | 'system';

export type NotificationPreferences = {
  beforeEnd: boolean;
  end: boolean;
  eatingWindowEnd: boolean;
  water: boolean;
};

export type Settings = {
  id: 'settings';
  onboardingDone: boolean;
  protocolId: ProtocolId;
  /** 'HH:MM' */
  lastMealTime: string;
  theme: ThemePreference;
  locale: LocalePreference;
  notifications: NotificationPreferences;
  waterGoalMl: number;
  weightGoalKg?: number;
  /** ustawiona ręcznie; jeśli brak – pierwszy pomiar */
  startWeightKg?: number;
};
