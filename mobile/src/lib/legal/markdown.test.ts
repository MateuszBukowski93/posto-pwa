import { describe, expect, it } from 'vitest';
import * as en from './content/en';
import * as pl from './content/pl';
import { fillPlaceholders, loadLegalDocument } from './load';
import { parseLegalMarkdown } from './markdown';

describe('parseLegalMarkdown', () => {
  it('rozpoznaje tytuł, datę, sekcje, listy i znaczniki', () => {
    const doc = parseLegalMarkdown(`# Regulamin

Obowiązuje od [DATA]
## §1. Ogólne

1. Pierwszy
2. Drugi

<!-- highlight -->
## §2. Ważne

Akapit
w dwóch liniach.

- punkt

<!-- note -->
[DO UZUPEŁNIENIA]
`);
    expect(doc.title).toBe('Regulamin');
    expect(doc.meta).toBe('Obowiązuje od [DATA]');
    expect(doc.sections).toEqual([
      { heading: '§1. Ogólne', highlight: false, blocks: [{ type: 'ol', items: ['Pierwszy', 'Drugi'] }] },
      {
        heading: '§2. Ważne',
        highlight: true,
        blocks: [
          { type: 'p', text: 'Akapit w dwóch liniach.' },
          { type: 'ul', items: ['punkt'] },
          { type: 'p', text: '[DO UZUPEŁNIENIA]', note: true },
        ],
      },
    ]);
  });

  it('treści parsują się i nie zostawiają nieznanych tokenów', () => {
    for (const [locale, sources] of [
      ['pl', pl],
      ['en', en],
    ] as const) {
      for (const kind of ['terms', 'privacy'] as const) {
        expect(fillPlaceholders(sources[kind])).not.toMatch(/\{\{\w+\}\}/);
        const doc = loadLegalDocument(kind, locale);
        expect(doc.title.length).toBeGreaterThan(3);
        expect(doc.sections.length).toBeGreaterThanOrEqual(11);
        expect(doc.sections.filter((s) => s.highlight)).toHaveLength(1);
      }
    }
  });

  it('wersja angielska ma tę samą strukturę co polska', () => {
    for (const kind of ['terms', 'privacy'] as const) {
      const shape = (locale: 'pl' | 'en') =>
        loadLegalDocument(kind, locale).sections.map((s) => [s.highlight, s.blocks.map((b) => b.type)]);
      expect(shape('en')).toEqual(shape('pl'));
    }
  });
});
