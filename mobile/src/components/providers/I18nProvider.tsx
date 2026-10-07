import { getCalendars, useLocales } from 'expo-localization';
import { createContext, use, useMemo, type ReactNode } from 'react';
import { IntlProvider } from 'use-intl';
import { resolveLocale } from '@/lib/domain/settings';
import type { AppLocale, LocalePreference } from '@/lib/domain/types';
import { MESSAGES, resolveFormatLocale } from '@/lib/i18n/messages';

type LocaleInfo = {
  /** język komunikatów */
  locale: AppLocale;
  /** locale do Intl (np. en-GB) */
  formatLocale: string;
  /** język, który wybrałaby opcja „Jak w telefonie” */
  systemLocale: AppLocale;
  /** zegar 24 h wg ustawień telefonu (pickery godziny na Androidzie) */
  is24Hour: boolean;
};

const LocaleContext = createContext<LocaleInfo>({
  locale: 'pl',
  formatLocale: 'pl-PL',
  systemLocale: 'pl',
  is24Hour: true,
});

export function I18nProvider({ preference, children }: { preference: LocalePreference; children: ReactNode }) {
  // klucz tekstowy – useLocales zwraca nową tablicę przy każdym renderze
  const languagesKey = useLocales()
    .map((l) => l.languageTag)
    .join(',');

  const info = useMemo<LocaleInfo>(() => {
    const tags = languagesKey ? languagesKey.split(',') : [];
    const locale = resolveLocale(preference, tags);
    const calendar = getCalendars()[0];
    return {
      locale,
      formatLocale: resolveFormatLocale(locale, tags),
      systemLocale: resolveLocale('system', tags),
      is24Hour: calendar?.uses24hourClock ?? locale !== 'en',
    };
  }, [preference, languagesKey]);

  const timeZone = getCalendars()[0]?.timeZone ?? 'Europe/Warsaw';

  return (
    <IntlProvider
      locale={info.locale}
      messages={MESSAGES[info.locale]}
      timeZone={timeZone}
      getMessageFallback={({ key, namespace }) => (namespace ? `${namespace}.${key}` : key)}
    >
      <LocaleContext value={info}>{children}</LocaleContext>
    </IntlProvider>
  );
}

export function useLocaleInfo(): LocaleInfo {
  return use(LocaleContext);
}
