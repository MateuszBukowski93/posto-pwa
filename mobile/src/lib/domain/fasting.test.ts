import { describe, expect, it } from 'vitest';
import {
  computeTimerState,
  getActiveFast,
  getLastEndedFast,
  validateFastEnd,
  validateFastRange,
  validateFastStart,
} from './fasting';
import { getProtocol } from './protocols';
import { atLocalTime, HOUR, MINUTE } from './time';
import type { Fast } from './types';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();
const fast = (id: string, startedAt: number, endedAt?: number, goalHours = 16): Fast => ({
  id,
  startedAt,
  endedAt,
  goalHours,
  protocolId: '16:8',
});

describe('computeTimerState', () => {
  const protocol = getProtocol('16:8');

  it('w trakcie postu liczy czas z timestampów', () => {
    const now = at(2026, 10, 5, 10, 33);
    const state = computeTimerState({
      fasts: [fast('a', at(2026, 10, 4, 20, 0))],
      now,
      protocol,
      lastMealTime: '20:00',
    });
    expect(state.kind).toBe('fasting');
    if (state.kind !== 'fasting') return;
    expect(state.elapsed).toBe(14 * HOUR + 33 * MINUTE);
    expect(state.remaining).toBe(HOUR + 27 * MINUTE);
    expect(state.goalEndsAt).toBe(at(2026, 10, 5, 12, 0));
    expect(state.reached).toBe(false);
    expect(state.overflow).toBe(0);
    expect(state.phaseIndex).toBe(2);
  });

  it('po przekroczeniu celu pokazuje drugie okrążenie', () => {
    const now = at(2026, 10, 5, 16, 0); // 20 h
    const state = computeTimerState({ fasts: [fast('a', at(2026, 10, 4, 20))], now, protocol, lastMealTime: '20:00' });
    if (state.kind !== 'fasting') throw new Error('expected fasting');
    expect(state.reached).toBe(true);
    expect(state.progress).toBe(1);
    expect(state.overflow).toBeCloseTo(4 / 16);
    expect(state.remaining).toBe(0);
  });

  it('po zakończeniu przechodzi w okno jedzenia z celem 24 − godziny postu', () => {
    const now = at(2026, 10, 5, 14, 0);
    const state = computeTimerState({
      fasts: [fast('a', at(2026, 10, 4, 20), at(2026, 10, 5, 12))],
      now,
      protocol: getProtocol('18:6'),
      lastMealTime: '20:00',
    });
    if (state.kind !== 'eating') throw new Error('expected eating');
    expect(state.goalMs).toBe(6 * HOUR);
    expect(state.elapsed).toBe(2 * HOUR);
    expect(state.nextFastAt).toBe(at(2026, 10, 5, 18));
  });

  it('bez żadnego postu planuje start wg godziny ostatniego posiłku', () => {
    const now = at(2026, 10, 5, 9, 0);
    const state = computeTimerState({ fasts: [], now, protocol, lastMealTime: '20:00' });
    expect(state).toEqual({ kind: 'idle', goalMs: 16 * HOUR, nextFastAt: at(2026, 10, 5, 20) });
  });

  it('wybiera aktywny i ostatnio zakończony post', () => {
    const fasts = [
      fast('a', at(2026, 10, 1, 20), at(2026, 10, 2, 12)),
      fast('b', at(2026, 10, 3, 20), at(2026, 10, 4, 12)),
      fast('c', at(2026, 10, 4, 20)),
    ];
    expect(getActiveFast(fasts)?.id).toBe('c');
    expect(getLastEndedFast(fasts)?.id).toBe('b');
    expect(getLastEndedFast(fasts, 'b')?.id).toBe('a');
  });
});

describe('walidacja edycji startu', () => {
  const now = at(2026, 10, 5, 9, 0);

  it('akceptuje „wczoraj 19:00”', () => {
    expect(validateFastStart(atLocalTime(now, 1, '19:00'), { now })).toEqual({ ok: true });
  });

  it('blokuje godzinę w przyszłości', () => {
    expect(validateFastStart(atLocalTime(now, 0, '09:01'), { now })).toEqual({ ok: false, reason: 'future' });
  });

  it('blokuje start przed końcem poprzedniego postu', () => {
    const previousEndedAt = at(2026, 10, 4, 21, 0);
    expect(validateFastStart(atLocalTime(now, 1, '19:00'), { now, previousEndedAt })).toEqual({
      ok: false,
      reason: 'beforePreviousEnd',
      previousEndedAt,
    });
  });

  it('odrzuca brak godziny', () => {
    expect(validateFastStart(null, { now })).toEqual({ ok: false, reason: 'invalid' });
  });

  it('koniec postu: nie w przyszłości i nie przed startem', () => {
    const startedAt = at(2026, 10, 4, 20);
    expect(validateFastEnd(at(2026, 10, 5, 8), { now, startedAt })).toEqual({ ok: true });
    expect(validateFastEnd(at(2026, 10, 5, 10), { now, startedAt })).toEqual({ ok: false, reason: 'future' });
    expect(validateFastEnd(at(2026, 10, 4, 19), { now, startedAt })).toEqual({ ok: false, reason: 'beforeStart' });
  });

  it('edycja w historii wykrywa nakładanie się postów', () => {
    const fasts = [
      fast('a', at(2026, 10, 1, 20), at(2026, 10, 2, 12)),
      fast('b', at(2026, 10, 3, 20), at(2026, 10, 4, 12)),
    ];
    const ctx = { now, fasts };
    expect(validateFastRange({ id: 'b', startedAt: at(2026, 10, 3, 18), endedAt: at(2026, 10, 4, 12) }, ctx)).toEqual({
      ok: true,
    });
    expect(validateFastRange({ id: 'b', startedAt: at(2026, 10, 2, 10), endedAt: at(2026, 10, 4, 12) }, ctx)).toEqual({
      ok: false,
      reason: 'overlap',
    });
    expect(validateFastRange({ id: 'b', startedAt: at(2026, 10, 4, 12), endedAt: at(2026, 10, 4, 11) }, ctx)).toEqual({
      ok: false,
      reason: 'endBeforeStart',
    });
    expect(validateFastRange({ id: 'b', startedAt: at(2026, 10, 4, 12), endedAt: at(2026, 10, 6, 11) }, ctx)).toEqual({
      ok: false,
      reason: 'future',
    });
  });
});
