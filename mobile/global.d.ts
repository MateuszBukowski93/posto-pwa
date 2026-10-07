import type messages from './messages/pl.json';
import type { AppLocale } from './src/lib/domain/types';

// Klucze komunikatów sprawdzane przy kompilacji (jak w wersji PWA z next-intl).
declare module 'use-intl' {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
