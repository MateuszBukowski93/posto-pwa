import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from './backup';
import { NOTIFICATION_HORIZON_MS, planNotifications } from './notifications';
import { getProtocol, PROTOCOLS } from './protocols';
import { DEFAULT_SETTINGS, normalizeSettings, resolveLocale } from './settings';
import { HOUR } from './time';
import type { Fast } from './types';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

describe('protokoły', () => {
  it('mają post + jedzenie = 24 h', () => {
    expect(PROTOCOLS).toHaveLength(6);
    for (const p of PROTOCOLS) expect(p.fastHours + p.eatHours).toBe(24);
    expect(getProtocol('nieznany').id).toBe('16:8');
    expect(getProtocol('18:6').messageKey).toBe('p18_6');
  });
});

describe('ustawienia', () => {
  it('resolveLocale', () => {
    expect(resolveLocale('en', ['pl-PL'])).toBe('en');
    expect(resolveLocale('system', ['de-AT', 'en'])).toBe('de');
    expect(resolveLocale('system', ['sv-SE', 'uk-UA'])).toBe('uk');
    expect(resolveLocale('system', ['sv-SE'])).toBe('pl');
  });

  it('normalizeSettings uzupełnia braki i odrzuca śmieci', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    const s = normalizeSettings({
      protocolId: '99:1' as never,
      theme: 'neon' as never,
      waterGoalMl: 99999,
      weightGoalKg: -3,
    });
    expect(s.protocolId).toBe('16:8');
    expect(s.theme).toBe('system');
    expect(s.waterGoalMl).toBe(5000);
    expect(s.weightGoalKg).toBeUndefined();
  });
});

describe('plan powiadomień', () => {
  const protocol = getProtocol('16:8');
  const prefs = { beforeEnd: true, end: true, eatingWindowEnd: true, water: true };

  it('w trakcie postu: 30 min przed końcem i w chwili osiągnięcia celu', () => {
    const fasts: Fast[] = [{ id: 'a', startedAt: at(2026, 10, 4, 20), goalHours: 16, protocolId: '16:8' }];
    const plan = planNotifications({ prefs: { ...prefs, water: false }, fasts, protocol, now: at(2026, 10, 5, 9) });
    expect(plan.map((p) => [p.kind, p.at])).toEqual([
      ['beforeEnd', at(2026, 10, 5, 11, 30)],
      ['end', at(2026, 10, 5, 12)],
    ]);
  });

  it('w oknie jedzenia: godzinę przed startem kolejnego postu', () => {
    const fasts: Fast[] = [
      { id: 'a', startedAt: at(2026, 10, 4, 20), endedAt: at(2026, 10, 5, 12), goalHours: 16, protocolId: '16:8' },
    ];
    const plan = planNotifications({ prefs: { ...prefs, water: false }, fasts, protocol, now: at(2026, 10, 5, 13) });
    expect(plan).toEqual([
      { id: expect.any(String), kind: 'eatingWindowEnd', at: at(2026, 10, 5, 19), fastStartAt: at(2026, 10, 5, 20) },
    ]);
  });

  it('woda co 2 h od 8:00 do 20:00 w horyzoncie doby', () => {
    const plan = planNotifications({
      prefs: { ...prefs, beforeEnd: false, end: false, eatingWindowEnd: false },
      fasts: [],
      protocol,
      now: at(2026, 10, 5, 15),
    });
    expect(plan.map((p) => new Date(p.at).getHours())).toEqual([16, 18, 20, 8, 10, 12, 14]);
    expect(new Set(plan.map((p) => p.id)).size).toBe(plan.length);
  });

  it('woda w dłuższym horyzoncie (planowanie w systemie na kilka dni)', () => {
    const plan = planNotifications({
      prefs: { ...prefs, beforeEnd: false, end: false, eatingWindowEnd: false },
      fasts: [],
      protocol,
      now: at(2026, 10, 5, 15),
      horizonMs: NOTIFICATION_HORIZON_MS,
    });
    // dziś 16–20 (3) + dwa pełne dni (14) + trzeci dzień do 15:00 (4)
    expect(plan).toHaveLength(21);
    expect(plan[plan.length - 1].at).toBe(at(2026, 10, 8, 14));
    expect(new Set(plan.map((p) => p.id)).size).toBe(plan.length);
  });

  it('wyłączone przełączniki = pusty plan', () => {
    const off = { beforeEnd: false, end: false, eatingWindowEnd: false, water: false };
    expect(planNotifications({ prefs: off, fasts: [], protocol, now: at(2026, 10, 5, 15) })).toEqual([]);
  });
});

describe('kopia zapasowa', () => {
  const now = at(2026, 10, 5, 12);
  const data = {
    fasts: [{ id: 'a', startedAt: now - 17 * HOUR, endedAt: now - HOUR, goalHours: 16, protocolId: '16:8' as const }],
    weights: [{ id: 'w', at: now, kg: 82.4 }],
    water: [{ id: 'h', at: now, ml: 250 }],
    settings: { ...DEFAULT_SETTINGS, onboardingDone: true },
  };

  it('eksport → import zwraca te same dane', () => {
    const text = JSON.stringify(createBackup(data, now));
    const result = parseBackup(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.counts).toEqual({ fasts: 1, weights: 1, water: 1 });
    expect(result.backup.data).toEqual(data);
    expect(result.backup.schemaVersion).toBe(1);
  });

  it('odrzuca niepoprawne pliki', () => {
    expect(parseBackup('{')).toEqual({ ok: false, error: 'json' });
    expect(parseBackup('{"app":"inna"}')).toEqual({ ok: false, error: 'format' });
    expect(parseBackup(JSON.stringify({ ...createBackup(data, now), schemaVersion: 99 }))).toEqual({
      ok: false,
      error: 'version',
    });
    const broken = createBackup({ ...data, weights: [{ id: 'w', at: now, kg: -1 }] }, now);
    expect(parseBackup(JSON.stringify(broken))).toEqual({ ok: false, error: 'format' });
  });
});
