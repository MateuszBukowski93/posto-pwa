import fs from 'node:fs';
import path from 'node:path';
import { siteConfig, type SiteConfigKey } from '@/lib/config';
import { parseLegalMarkdown, type LegalDocument } from './markdown';

/** Ładowane tylko przy buildzie (Server Component) – treść trafia do statycznego HTML. */

export type LegalKind = 'terms' | 'privacy';

/** Polska wersja jest wiążąca; pozostałe języki pokazują angielską z adnotacją. */
export type LegalDocuments = { pl: LegalDocument; en: LegalDocument };

export function fillPlaceholders(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in siteConfig ? siteConfig[key as SiteConfigKey] : match,
  );
}

export function loadLegalDocuments(kind: LegalKind): LegalDocuments {
  const read = (locale: 'pl' | 'en') => {
    const file = path.join(process.cwd(), 'content', 'legal', locale, `${kind}.md`);
    return parseLegalMarkdown(fillPlaceholders(fs.readFileSync(file, 'utf8')));
  };
  return { pl: read('pl'), en: read('en') };
}
