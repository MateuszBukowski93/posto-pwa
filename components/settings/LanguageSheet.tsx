'use client';

import { useTranslations } from 'next-intl';
import { useLocaleInfo } from '@/components/providers/I18nProvider';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { IconCheck } from '@/components/ui/icons';
import type { AppLocale, LocalePreference } from '@/lib/domain/types';
import { useRovingFocus } from '@/lib/hooks/useRovingFocus';

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

const OPTIONS: LocalePreference[] = ['system', 'pl', 'en', 'de', 'es', 'fr', 'it', 'pt', 'uk'];

export function languageName(code: AppLocale, inLocale: string): string {
  try {
    return new Intl.DisplayNames([inLocale], { type: 'language' }).of(code) ?? LANGUAGE_NAMES[code];
  } catch {
    return LANGUAGE_NAMES[code];
  }
}

type Props = {
  open: boolean;
  value: LocalePreference;
  onClose: () => void;
  onSelect: (value: LocalePreference) => void;
};

export function LanguageSheet({ open, value, onClose, onSelect }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} titleId="lang-title" gap={14}>
      <LanguageList value={value} onSelect={onSelect} />
    </BottomSheet>
  );
}

function LanguageList({ value, onSelect }: Pick<Props, 'value' | 'onSelect'>) {
  const t = useTranslations('settings');
  const { locale, systemLocale } = useLocaleInfo();
  const selectedIndex = OPTIONS.indexOf(value);
  // Strzałki tylko przenoszą fokus – wybór (który zamyka arkusz) dopiero Enter/Spacją.
  const { getItemProps } = useRovingFocus(OPTIONS.length, selectedIndex, () => {}, {
    selectOnMove: false,
    orientation: 'vertical',
  });

  return (
    <>
      <SheetHeader titleId="lang-title" title={t('language')} />
      <div
        role="radiogroup"
        aria-labelledby="lang-title"
        className="flex flex-col overflow-hidden rounded-[18px] border border-line"
      >
        {OPTIONS.map((option, index) => {
          const selected = option === value;
          const native = option === 'system' ? t('languageSystem') : LANGUAGE_NAMES[option];
          const sub =
            option === 'system'
              ? t('languageSystemSub', { language: languageName(systemLocale, locale) })
              : languageName(option, locale);
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              data-autofocus={selected ? '' : undefined}
              onClick={() => onSelect(option)}
              {...getItemProps(index)}
              className={`flex min-h-[52px] items-center justify-between gap-3 border-0 px-4 py-1.5 text-left font-sans text-ink ${
                index > 0 ? 'border-t border-line' : ''
              } ${selected ? 'bg-accent-soft' : 'bg-transparent'}`}
            >
              <span className="flex flex-col gap-px">
                <span lang={option === 'system' ? undefined : option} className="text-[15px] font-bold">
                  {native}
                </span>
                <span className="text-xs text-muted">{sub}</span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${selected ? 'bg-accent' : 'bg-transparent'}`}
              >
                {selected ? <IconCheck size={14} strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
