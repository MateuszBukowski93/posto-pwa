'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { BASE } from '@/lib/config';
import { type Locale, localeNames, locales } from '@/lib/dictionaries';

/** Uproszczone flagi (3:2) – SVG, a nie emoji, bo Windows nie rysuje flag-emoji. */
const flags: Record<Locale, ReactNode> = {
  pl: (
    <>
      <rect width="30" height="10" fill="#FFFFFF" />
      <rect y="10" width="30" height="10" fill="#DC143C" />
    </>
  ),
  en: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.4" />
      <path d="M15 0v20M0 10h30" stroke="#FFFFFF" strokeWidth="6.5" />
      <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.8" />
    </>
  ),
  uk: (
    <>
      <rect width="30" height="10" fill="#0057B7" />
      <rect y="10" width="30" height="10" fill="#FFD700" />
    </>
  ),
  de: (
    <>
      <rect width="30" height="6.67" fill="#000000" />
      <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
      <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
    </>
  ),
  fr: (
    <>
      <rect width="10" height="20" fill="#002654" />
      <rect x="10" width="10" height="20" fill="#FFFFFF" />
      <rect x="20" width="10" height="20" fill="#ED2939" />
    </>
  ),
  es: (
    <>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </>
  ),
};

function Flag({ locale }: { locale: Locale }) {
  return (
    <svg className="flag" width="24" height="16" viewBox="0 0 30 20" preserveAspectRatio="none" aria-hidden="true">
      {flags[locale]}
    </svg>
  );
}

/** Adres wersji językowej – polska jest pod `/`, pozostałe pod `/<kod>/`. */
function localeHref(locale: Locale) {
  return locale === 'pl' ? `${BASE}/` : `${BASE}/${locale}/`;
}

/** Wybór języka: natywne <details> (działa bez JS), JS tylko domyka menu kliknięciem obok i Escape. */
export function LanguageMenu({ lang, label }: { lang: Locale; label: string }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const onPointerDown = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) details.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && details.open) {
        details.open = false;
        details.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <details ref={ref} className="lang">
      <summary aria-label={`${label}: ${localeNames[lang]}`}>
        <Flag locale={lang} />
        <span lang={lang}>{localeNames[lang]}</span>
        <svg className="lang-chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <nav aria-label={label} className="lang-menu">
        {locales.map((locale) => (
          <a
            key={locale}
            href={localeHref(locale)}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === lang ? 'page' : undefined}
          >
            <Flag locale={locale} />
            <span>{localeNames[locale]}</span>
            {locale === lang ? (
              <svg className="lang-check" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </a>
        ))}
      </nav>
    </details>
  );
}
