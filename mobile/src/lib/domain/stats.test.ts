import { describe, expect, it } from 'vitest';
import { computePeriodStats, computeStreaks, computeWeekBars, recentFasts } from './stats';
import { HOUR } from './time';
import type { Fast } from './types';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
let seq = 0;
/** Post kończący się danego dnia o 12:00 i trwający `hours` godzin. */
const endedOn = (y: number, m: number, d: number, hours: number, goalHours = 16): Fast => {
  const endedAt = at(y, m, d, 12);
  return { id: `f${seq++}`, startedAt: endedAt - hours * HOUR, endedAt, goalHours, protocolId: '16:8' };
};

describe('computeStreaks', () => {
  const now = at(2026, 10, 5, 18); // poniedziałek

  it('liczy serię od dziś', () => {
    const fasts = [endedOn(2026, 10, 3, 16), endedOn(2026, 10, 4, 17), endedOn(2026, 10, 5, 16.5)];
    expect(computeStreaks(fasts, now)).toEqual({ current: 3, longest: 3 });
  });

  it('liczy serię od wczoraj, jeśli dziś jeszcze nic się nie zakończyło', () => {
    const fasts = [endedOn(2026, 10, 3, 16), endedOn(2026, 10, 4, 17)];
    expect(computeStreaks(fasts, now).current).toBe(2);
  });

  it('post poniżej celu przerywa serię', () => {
    const fasts = [
      endedOn(2026, 9, 28, 16),
      endedOn(2026, 9, 29, 16),
      endedOn(2026, 9, 30, 16),
      endedOn(2026, 10, 1, 16),
      endedOn(2026, 10, 2, 15), // poniżej celu
      endedOn(2026, 10, 3, 16),
      endedOn(2026, 10, 4, 16),
    ];
    expect(computeStreaks(fasts, now)).toEqual({ current: 2, longest: 4 });
  });

  it('dwa dni przerwy zerują bieżącą serię', () => {
    expect(computeStreaks([endedOn(2026, 10, 2, 16)], now)).toEqual({ current: 0, longest: 1 });
    expect(computeStreaks([], now)).toEqual({ current: 0, longest: 0 });
  });

  it('seria przechodzi przez zmianę czasu', () => {
    const fasts = [endedOn(2026, 10, 24, 16), endedOn(2026, 10, 25, 16), endedOn(2026, 10, 26, 16)];
    expect(computeStreaks(fasts, at(2026, 10, 26, 20)).current).toBe(3);
  });
});

describe('computeWeekBars', () => {
  it('przypisuje posty do dnia zakończenia i oznacza trwający post', () => {
    const now = at(2026, 10, 7, 9); // środa
    const active: Fast = { id: 'active', startedAt: at(2026, 10, 6, 20), goalHours: 16, protocolId: '16:8' };
    const bars = computeWeekBars([endedOn(2026, 10, 5, 16.2), endedOn(2026, 10, 6, 15.1), active], now);
    expect(bars).toHaveLength(7);
    expect(bars[0]).toMatchObject({ status: 'reached', isToday: false });
    expect(bars[0].hours).toBeCloseTo(16.2);
    expect(bars[1]).toMatchObject({ status: 'below' });
    expect(bars[2]).toMatchObject({ status: 'ongoing', isToday: true, hours: 13 });
    expect(bars[3]).toMatchObject({ status: 'empty', hours: null });
  });
});

describe('computePeriodStats', () => {
  it('liczy średnią, najdłuższy i ukończone z 28 dni', () => {
    const now = at(2026, 10, 5, 18);
    const fasts = [
      endedOn(2026, 9, 1, 20), // poza oknem
      endedOn(2026, 9, 20, 16),
      endedOn(2026, 9, 25, 14),
      endedOn(2026, 10, 4, 20.25),
    ];
    const stats = computePeriodStats(fasts, now);
    expect(stats.total).toBe(3);
    expect(stats.reached).toBe(2);
    expect(stats.longestMs).toBe(20.25 * HOUR);
    expect(stats.averageMs).toBeCloseTo(((16 + 14 + 20.25) / 3) * HOUR);
    expect(computePeriodStats([], now)).toEqual({ total: 0, reached: 0, averageMs: null, longestMs: null });
  });

  it('recentFasts zwraca zakończone od najnowszego', () => {
    const fasts = [endedOn(2026, 10, 1, 16), endedOn(2026, 10, 3, 16), endedOn(2026, 10, 2, 16)];
    expect(recentFasts(fasts).map((f) => f.endedAt)).toEqual([
      at(2026, 10, 3, 12),
      at(2026, 10, 2, 12),
      at(2026, 10, 1, 12),
    ]);
  });
});
