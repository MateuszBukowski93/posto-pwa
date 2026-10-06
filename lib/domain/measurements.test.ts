import { describe, expect, it } from 'vitest';
import { DAY } from './time';
import type { WaterEntry, WeightEntry } from './types';
import { lastWaterEntryForDay, waterGlasses, waterTotalForDay } from './water';
import {
  latestWeight,
  parseKg,
  previousWeight,
  resolveStartWeight,
  sparklineGeometry,
  weightChangeOverDays,
  weightGoalProgress,
  weightTrend,
} from './weight';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

describe('woda', () => {
  const entries: WaterEntry[] = [
    { id: 'y', at: at(2026, 10, 4, 22), ml: 250 },
    ...[8, 9, 10, 11, 12].map((h) => ({ id: `t${h}`, at: at(2026, 10, 5, h), ml: 250 })),
  ];

  it('+250 ml ×5 = 1,25 l, a następnego dnia licznik od zera', () => {
    expect(waterTotalForDay(entries, at(2026, 10, 5, 13))).toBe(1250);
    expect(waterTotalForDay(entries, at(2026, 10, 6, 0, 1))).toBe(0);
  });

  it('cofnięcie dotyczy ostatniego wpisu z bieżącego dnia', () => {
    expect(lastWaterEntryForDay(entries, at(2026, 10, 5, 13))?.id).toBe('t12');
    expect(lastWaterEntryForDay(entries, at(2026, 10, 6, 8))).toBeUndefined();
  });

  it('siatka szklanek', () => {
    expect(waterGlasses(2500, 1250)).toEqual({ cells: 10, filled: 5, columns: 10 });
    expect(waterGlasses(3000, 5000)).toEqual({ cells: 12, filled: 12, columns: 6 });
    expect(waterGlasses(1500, 0)).toEqual({ cells: 6, filled: 0, columns: 6 });
  });
});

describe('waga', () => {
  const now = at(2026, 10, 5, 8);
  const w = (id: string, ts: number, kg: number): WeightEntry => ({ id, at: ts, kg });
  const entries = [
    w('a', now - 40 * DAY, 85.0),
    w('b', now - 29 * DAY, 84.5),
    w('c', now - 2 * DAY, 82.7),
    w('d', now - DAY, 82.7),
    w('e', now - 60_000, 82.4),
  ];

  it('aktualna i poprzednia waga', () => {
    expect(latestWeight(entries)?.kg).toBe(82.4);
    expect(previousWeight(entries)?.kg).toBe(82.7);
  });

  it('zmiana w 30 dniach liczona od stanu sprzed okresu', () => {
    expect(weightChangeOverDays(entries, now)).toBe(-2.6);
    expect(weightChangeOverDays(entries.slice(1), now)).toBe(-2.1);
    expect(weightChangeOverDays([w('x', now, 80)], now)).toBeNull();
  });

  it('trend zawiera tylko ostatnie 30 dni', () => {
    expect(weightTrend(entries, now).map((e) => e.id)).toEqual(['b', 'c', 'd', 'e']);
  });

  it('postęp do celu', () => {
    expect(weightGoalProgress(84.5, 78, 82.4)).toBeCloseTo(2.1 / 6.5);
    expect(weightGoalProgress(60, 65, 62)).toBeCloseTo(0.4);
    expect(weightGoalProgress(84.5, 78, 86)).toBe(0);
    expect(weightGoalProgress(84.5, undefined, 82)).toBeNull();
    expect(resolveStartWeight(undefined, entries)).toBe(85.0);
    expect(resolveStartWeight(90, entries)).toBe(90);
  });

  it('parseKg akceptuje przecinek i kropkę', () => {
    expect(parseKg('82,4')).toBe(82.4);
    expect(parseKg(' 82.45 ')).toBe(82.5);
    expect(parseKg('120')).toBe(120);
    expect(parseKg('5')).toBeNull();
    expect(parseKg('abc')).toBeNull();
    expect(parseKg('')).toBeNull();
  });

  it('geometria linii trendu mieści się w polu', () => {
    const geo = sparklineGeometry(weightTrend(entries, now), { width: 314, height: 64, pad: 6 });
    expect(geo).not.toBeNull();
    for (const [x, y] of geo!.points) {
      expect(x).toBeGreaterThanOrEqual(6);
      expect(x).toBeLessThanOrEqual(308);
      expect(y).toBeGreaterThanOrEqual(6);
      expect(y).toBeLessThanOrEqual(58);
    }
    expect(geo!.last[0]).toBe(308);
    expect(sparklineGeometry([], { width: 10, height: 10, pad: 1 })).toBeNull();
  });
});
