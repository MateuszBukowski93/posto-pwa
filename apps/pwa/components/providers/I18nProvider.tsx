'use client';

import { NextIntlClientProvider } from 'next-intl';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/config';
import { isLocalePreference, resolveLocale } from '@/lib/domain/settings';
import type { AppLocale, LocalePreference } from '@/lib/domain/types';
import pl from '@/messages/pl.json';
import { useSettings } from './SettingsProvider';

export type Messages = typeof pl;

const loaders: Record<AppLocale, () => Promise<Messages>> = {
  pl: async () => pl,
  en: () => import('@/messages/en.json').then((m) => m.default),
  de: () => import('@/messages/de.json').then((m) => m.default),
  es: () => import('@/messages/es.json').then((m) => m.default),
  fr: () => import('@/messages/fr.json').then((m) => m.default),
  it: () => import('@/messages/it.json').then((m) => m.default),
  pt: () => import('@/messages/pt.json').then((m) => m.default),
  uk: () => import('@/messages/uk.json').then((m) => m.default),
};

/** Domyślne regiony formatowania, gdy przeglądarka nie podpowiada lepszego. */
const DEFAULT_FORMAT_LOCALE: Record<AppLocale, string> = {
  pl: 'pl-PL',
  en: 'en-GB',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
  uk: 'uk-UA',
};

type LocaleInfo = {
  /** język komunikatów */
  locale: AppLocale;
  /** locale do Intl (np. en-GB) */
  formatLocale: string;
  /** język, który wybrałaby opcja „Jak w telefonie” */
  systemLocale: AppLocale;
};

const LocaleContext = createContext<LocaleInfo>({ locale: 'pl', formatLocale: 'pl-PL', systemLocale: 'pl' });

function browserLanguages(): readonly string[] {
  return navigator.languages?.length ? navigator.languages : [navigator.language];
}

function storedPreference(): LocalePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.locale);
    return isLocalePreference(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

type State = LocaleInfo & { messages: Messages; timeZone: string };

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings, loaded } = useSettings();
  const preference = loaded ? settings.locale : null;
  const [state, setState] = useState<State>({
    locale: 'pl',
    formatLocale: 'pl-PL',
    systemLocale: 'pl',
    messages: pl,
    // Daty formatujemy sami przez Intl (lib/format.ts); strefa jest tu tylko dla porządku next-intl.
    timeZone: 'Europe/Warsaw',
  });

  useEffect(() => {
    let cancelled = false;
    const languages = browserLanguages();
    const target = resolveLocale(preference ?? storedPreference(), languages);
    const systemLocale = resolveLocale('system', languages);
    const formatLocale =
      languages.find((l) => l.includes('-') && l.toLowerCase().startsWith(`${target}-`)) ??
      DEFAULT_FORMAT_LOCALE[target];
    loaders[target]()
      .then((messages) => {
        if (cancelled) return;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setState((prev) =>
          prev.locale === target &&
          prev.formatLocale === formatLocale &&
          prev.systemLocale === systemLocale &&
          prev.timeZone === timeZone
            ? prev
            : { locale: target, formatLocale, systemLocale, messages, timeZone },
        );
        document.documentElement.lang = target;
      })
      .finally(() => {
        if (!cancelled) document.documentElement.removeAttribute('data-i18n-pending');
      });
    return () => {
      cancelled = true;
    };
  }, [preference]);

  return (
    <NextIntlClientProvider
      locale={state.locale}
      messages={state.messages}
      timeZone={state.timeZone}
      getMessageFallback={({ key, namespace }) => (namespace ? `${namespace}.${key}` : key)}
    >
      <LocaleContext value={state}>{children}</LocaleContext>
    </NextIntlClientProvider>
  );
}

export function useLocaleInfo(): LocaleInfo {
  return use(LocaleContext);
}
