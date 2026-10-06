import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { fillPlaceholders } from './load';
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

  it('pliki treści parsują się i nie zostawiają nieznanych tokenów', () => {
    for (const locale of ['pl', 'en']) {
      for (const kind of ['terms', 'privacy']) {
        const raw = fs.readFileSync(path.join(process.cwd(), 'content/legal', locale, `${kind}.md`), 'utf8');
        const filled = fillPlaceholders(raw);
        expect(filled).not.toMatch(/\{\{\w+\}\}/);
        const doc = parseLegalMarkdown(filled);
        expect(doc.title.length).toBeGreaterThan(3);
        expect(doc.sections.length).toBeGreaterThanOrEqual(11);
        expect(doc.sections.filter((s) => s.highlight)).toHaveLength(1);
      }
    }
  });
});
