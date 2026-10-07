import { describe, expect, it } from 'vitest';
import { fallbackUnitLabel, formatKg, formatLiters, formatSignedDelta } from './format';

describe('formatowanie', () => {
  it('kg i litry wg języka', () => {
    expect(formatKg('pl-PL', 82.4, true)).toMatch(/^82,4\skg$/);
    expect(formatLiters('pl-PL', 1250)).toMatch(/^1,25\sl$/);
    expect(formatLiters('en-GB', 1250)).toMatch(/^1\.25\sl$/);
    expect(formatKg('uk-UA', 82.4, true)).toMatch(/^82,4\sкг$/);
  });

  it('jednostki zapasowe zgodne z Intl (gdy silnik nie zna style: unit)', () => {
    for (const locale of ['pl-PL', 'en-GB', 'en-US', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'pt-PT', 'uk-UA']) {
      for (const unit of ['kilogram', 'liter'] as const) {
        const intl = new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short' })
          .formatToParts(1)
          .find((p) => p.type === 'unit')?.value;
        expect(fallbackUnitLabel(locale, unit), `${locale} ${unit}`).toBe(intl);
      }
    }
  });

  it('różnica ze znakiem minus', () => {
    expect(formatSignedDelta('pl-PL', -0.34)).toBe('−0,3');
    expect(formatSignedDelta('pl-PL', 0.1)).toBe('+0,1');
    expect(formatSignedDelta('pl-PL', 0)).toBe('0,0');
  });
});
