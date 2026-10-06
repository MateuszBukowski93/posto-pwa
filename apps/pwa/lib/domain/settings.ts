import { DEFAULT_PROTOCOL_ID, isProtocolId } from './protocols';
import { parseTimeOfDay } from './time';
import { LOCALES, type AppLocale, type LocalePreference, type Settings, type ThemePreference } from './types';

export const SETTINGS_ID = 'settings' as const;

/**
 * Język używany, gdy ustawienie to „Jak w telefonie”, a telefon ma język spoza listy.
 * [DO DECYZJI] Specyfikacja wskazuje polski jako domyślny; dla użytkowników spoza PL
 * sensowniejszy może być 'en' – wystarczy zmienić tę stałą.
 */
export const FALLBACK_LOCALE: AppLocale = 'pl';

export const WATER_GOAL_MIN_ML = 1000;
export const WATER_GOAL_MAX_ML = 5000;

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  onboardingDone: false,
  protocolId: DEFAULT_PROTOCOL_ID,
  lastMealTime: '20:00',
  theme: 'system',
  locale: 'system',
  notifications: { beforeEnd: false, end: false, eatingWindowEnd: false, water: false },
  waterGoalMl: 2500,
};

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function isLocalePreference(value: unknown): value is LocalePreference {
  return value === 'system' || isAppLocale(value);
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/** Rozstrzyga faktyczny język UI na podstawie ustawienia i języków przeglądarki. */
export function resolveLocale(preference: LocalePreference, navigatorLanguages: readonly string[] = []): AppLocale {
  if (preference !== 'system') return preference;
  for (const tag of navigatorLanguages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isAppLocale(base)) return base;
  }
  return FALLBACK_LOCALE;
}

/** Scala zapisany rekord z wartościami domyślnymi i odrzuca niepoprawne pola. */
export function normalizeSettings(record: Partial<Settings> | null | undefined): Settings {
  const r = record ?? {};
  const notifications = { ...DEFAULT_SETTINGS.notifications, ...(r.notifications ?? {}) };
  const waterGoal =
    typeof r.waterGoalMl === 'number' && Number.isFinite(r.waterGoalMl)
      ? Math.min(WATER_GOAL_MAX_ML, Math.max(WATER_GOAL_MIN_ML, r.waterGoalMl))
      : DEFAULT_SETTINGS.waterGoalMl;
  return {
    id: SETTINGS_ID,
    onboardingDone: r.onboardingDone === true,
    protocolId: isProtocolId(r.protocolId) ? r.protocolId : DEFAULT_SETTINGS.protocolId,
    lastMealTime: parseTimeOfDay(r.lastMealTime) ? r.lastMealTime! : DEFAULT_SETTINGS.lastMealTime,
    theme: isThemePreference(r.theme) ? r.theme : DEFAULT_SETTINGS.theme,
    locale: isLocalePreference(r.locale) ? r.locale : DEFAULT_SETTINGS.locale,
    notifications: {
      beforeEnd: notifications.beforeEnd === true,
      end: notifications.end === true,
      eatingWindowEnd: notifications.eatingWindowEnd === true,
      water: notifications.water === true,
    },
    waterGoalMl: waterGoal,
    weightGoalKg: isPositiveNumber(r.weightGoalKg) ? r.weightGoalKg : undefined,
    startWeightKg: isPositiveNumber(r.startWeightKg) ? r.startWeightKg : undefined,
  };
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}
