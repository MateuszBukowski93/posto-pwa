import type messages from './messages/pl.json';
import type { AppLocale } from './lib/domain/types';

declare module 'next-intl' {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
