/** Placeholdery w nawiasach kwadratowych – jak w apps/pwa/lib/config.ts. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mateuszbukowski93.github.io/posto-pwa/';
export const APP_HOST = APP_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const COMPANY = 'DeveloArt Mateusz Bukowski';
export const EMAIL = 'kontakt@develoart.com';
export const BUY_ME_A_COFFEE = '[LINK BUY ME A COFFEE]';
