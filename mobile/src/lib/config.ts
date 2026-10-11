/**
 * Konfiguracja aplikacji i placeholdery do uzupełnienia przed publikacją.
 * Placeholdery w nawiasach kwadratowych są celowo zostawione – nie wymyślamy danych firmy.
 * Lista miejsc do uzupełnienia jest w README. Plik bez zależności od Expo (używany w testach).
 */

export const siteConfig = {
  appName: 'Posto',
  brand: 'DeveloArt',
  companyName: 'DeveloArt Mateusz Bukowski',
  address: 'ul. Raduńska 40A/3, 80-021 Gdańsk',
  nip: '5833271688',
  email: 'kontakt@develoart.com',
  effectiveDate: '11 października 2026',
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
