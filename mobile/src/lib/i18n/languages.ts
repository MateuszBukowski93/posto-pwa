import type { AppLocale } from '@/lib/domain/types';

/** Nazwy języków zapisane w ich własnym języku (jedyny tekst „na sztywno” w UI). */
export const LANGUAGE_NAMES: Record<AppLocale, string> = {
  pl: 'Polski',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português',
  uk: 'Українська',
};

/**
 * Nazwy języków w każdym języku interfejsu. Hermes nie ma Intl.DisplayNames,
 * więc zamiast niego trzymamy małą tabelę (8 × 8).
 */
const NAMES_IN: Record<AppLocale, Record<AppLocale, string>> = {
  pl: {
    pl: 'polski',
    en: 'angielski',
    de: 'niemiecki',
    es: 'hiszpański',
    fr: 'francuski',
    it: 'włoski',
    pt: 'portugalski',
    uk: 'ukraiński',
  },
  en: {
    pl: 'Polish',
    en: 'English',
    de: 'German',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    pt: 'Portuguese',
    uk: 'Ukrainian',
  },
  de: {
    pl: 'Polnisch',
    en: 'Englisch',
    de: 'Deutsch',
    es: 'Spanisch',
    fr: 'Französisch',
    it: 'Italienisch',
    pt: 'Portugiesisch',
    uk: 'Ukrainisch',
  },
  es: {
    pl: 'polaco',
    en: 'inglés',
    de: 'alemán',
    es: 'español',
    fr: 'francés',
    it: 'italiano',
    pt: 'portugués',
    uk: 'ucraniano',
  },
  fr: {
    pl: 'polonais',
    en: 'anglais',
    de: 'allemand',
    es: 'espagnol',
    fr: 'français',
    it: 'italien',
    pt: 'portugais',
    uk: 'ukrainien',
  },
  it: {
    pl: 'polacco',
    en: 'inglese',
    de: 'tedesco',
    es: 'spagnolo',
    fr: 'francese',
    it: 'italiano',
    pt: 'portoghese',
    uk: 'ucraino',
  },
  pt: {
    pl: 'polaco',
    en: 'inglês',
    de: 'alemão',
    es: 'espanhol',
    fr: 'francês',
    it: 'italiano',
    pt: 'português',
    uk: 'ucraniano',
  },
  uk: {
    pl: 'польська',
    en: 'англійська',
    de: 'німецька',
    es: 'іспанська',
    fr: 'французька',
    it: 'італійська',
    pt: 'португальська',
    uk: 'українська',
  },
};

export function languageName(code: AppLocale, inLocale: AppLocale): string {
  return NAMES_IN[inLocale][code];
}
