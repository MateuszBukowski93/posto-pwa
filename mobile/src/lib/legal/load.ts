import { siteConfig, type SiteConfigKey } from '@/lib/config';
import * as en from './content/en';
import * as pl from './content/pl';
import { parseLegalMarkdown, type LegalDocument } from './markdown';

export type LegalKind = 'terms' | 'privacy';

/** Polska wersja jest wiążąca; pozostałe języki pokazują angielską z adnotacją. */
export type LegalLocale = 'pl' | 'en';

const SOURCES: Record<LegalLocale, Record<LegalKind, string>> = { pl, en };

export function fillPlaceholders(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in siteConfig ? siteConfig[key as SiteConfigKey] : match,
  );
}

const cache = new Map<string, LegalDocument>();

export function loadLegalDocument(kind: LegalKind, locale: LegalLocale): LegalDocument {
  const key = `${kind}:${locale}`;
  let doc = cache.get(key);
  if (!doc) {
    doc = parseLegalMarkdown(fillPlaceholders(SOURCES[locale][kind]));
    cache.set(key, doc);
  }
  return doc;
}
