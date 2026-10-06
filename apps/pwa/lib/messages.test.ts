import fs from 'node:fs';
import path from 'node:path';
import { IntlMessageFormat } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';
import { LOCALES } from './domain/types';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') acc[full] = value;
    else Object.assign(acc, flatten(value, full));
    return acc;
  }, {});
}

const load = (locale: string) =>
  flatten(JSON.parse(fs.readFileSync(path.join(process.cwd(), 'messages', `${locale}.json`), 'utf8')) as Tree);

/** Nazwy argumentów ICU ({name} i {name, plural, …}). */
const args = (message: string) => new Set([...message.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]));

describe('komunikaty i18n', () => {
  const base = load('pl');

  for (const locale of LOCALES) {
    it(`${locale}: te same klucze i parametry co pl, poprawny ICU`, () => {
      const messages = load(locale);
      expect(Object.keys(messages).sort()).toEqual(Object.keys(base).sort());
      for (const [key, message] of Object.entries(messages)) {
        expect(() => new IntlMessageFormat(message, locale), `${locale}:${key}`).not.toThrow();
        expect([...args(message)].sort(), `${locale}:${key}`).toEqual([...args(base[key])].sort());
        expect(message.trim(), `${locale}:${key}`).not.toBe('');
      }
    });
  }
});
