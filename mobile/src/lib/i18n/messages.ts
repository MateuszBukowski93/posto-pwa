import type { AppLocale } from '@/lib/domain/types';
import de from '../../../messages/de.json';
import en from '../../../messages/en.json';
import es from '../../../messages/es.json';
import fr from '../../../messages/fr.json';
import it from '../../../messages/it.json';
import pl from '../../../messages/pl.json';
import pt from '../../../messages/pt.json';
import uk from '../../../messages/uk.json';

export type Messages = typeof pl;

/** Wszystkie języki są w paczce (razem kilkadziesiąt KB) – zmiana języka bez ładowania. */
export const MESSAGES: Record<AppLocale, Messages> = { pl, en, de, es, fr, it, pt, uk };

/** Domyślne regiony formatowania, gdy telefon nie podpowiada lepszego. */
export const DEFAULT_FORMAT_LOCALE: Record<AppLocale, string> = {
  pl: 'pl-PL',
  en: 'en-GB',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
  uk: 'uk-UA',
};

/** Locale do Intl: region z telefonu, jeśli pasuje do języka (np. en-US), inaczej domyślny. */
export function resolveFormatLocale(locale: AppLocale, deviceLanguages: readonly string[]): string {
  return (
    deviceLanguages.find((l) => l.includes('-') && l.toLowerCase().startsWith(`${locale}-`)) ??
    DEFAULT_FORMAT_LOCALE[locale]
  );
}
