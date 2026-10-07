/**
 * Konfiguracja aplikacji i placeholdery do uzupełnienia przed publikacją.
 * Placeholdery w nawiasach kwadratowych są celowo zostawione – nie wymyślamy danych firmy.
 * Lista miejsc do uzupełnienia jest w README. Plik bez zależności od Expo (używany w testach).
 */

export const siteConfig = {
  appName: 'Posto',
  brand: 'DeveloArt',
  companyName: '[NAZWA FIRMY]',
  address: '[ADRES]',
  nip: '[NIP]',
  email: '[E-MAIL]',
  effectiveDate: '[DATA]',
  buyMeACoffeeUrl: '[LINK BUY ME A COFFEE]',
} as const;

export type SiteConfigKey = keyof typeof siteConfig;

export function isRealUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

/** Nazwa pliku bazy SQLite na urządzeniu. */
export const DATABASE_NAME = 'posto.db';

/** Kanał powiadomień Androida (przypomnienia o poście i wodzie). */
export const NOTIFICATION_CHANNEL_ID = 'reminders';
