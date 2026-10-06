/**
 * Konfiguracja aplikacji i placeholdery do uzupełnienia przed publikacją.
 * Placeholdery w nawiasach kwadratowych są celowo zostawione – nie wymyślamy danych firmy.
 * Lista miejsc do uzupełnienia jest w README.
 */

/** Ścieżka bazowa (np. '/posto-pwa' na GitHub Pages). Ustawiana przy buildzie. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '0.0.0';
export const BUILD_SHA = (process.env.NEXT_PUBLIC_BUILD_SHA ?? '').slice(0, 7);

/**
 * Vercel Web Analytics (bez cookies) działa tylko przy hostingu na Vercel.
 * Na GitHub Pages zostaje wyłączona – włącz zmienną NEXT_PUBLIC_VERCEL_ANALYTICS=1 po przeniesieniu.
 */
export const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === '1';

export const siteConfig = {
  appName: 'Posto',
  brand: 'DeveloArt',
  companyName: '[NAZWA FIRMY]',
  address: '[ADRES]',
  nip: '[NIP]',
  email: '[E-MAIL]',
  /** Ustawiane w CI na adres GitHub Pages; lokalnie zostaje placeholder. */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || '[ADRES APLIKACJI]',
  effectiveDate: '[DATA]',
  buyMeACoffeeUrl: '[LINK BUY ME A COFFEE]',
  analyticsTool: 'Cloudflare Web Analytics',
  hostingProvider: '[NAZWA HOSTINGU, np. Vercel Inc.]',
  retentionPeriod: '[OKRES]',
} as const;

export type SiteConfigKey = keyof typeof siteConfig;

export function isRealUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

/** Kolory tła (manifest, theme-color). */
export const THEME_COLORS = { light: '#F2F4F1', dark: '#0E1311' } as const;

/** Klucze localStorage – lustro ustawień potrzebne skryptowi przed hydratacją. */
export const STORAGE_KEYS = {
  theme: 'posto:theme',
  locale: 'posto:locale',
  notified: 'posto:notified',
} as const;
