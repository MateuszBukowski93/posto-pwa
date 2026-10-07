import { fastDuration, fastGoalMs, getActiveFast, getEndedFasts } from './fasting';
import { addLocalDays, HOUR, localDayDiff, startOfLocalDay, startOfLocalWeek } from './time';
import type { Fast } from './types';

function reachedGoal(fast: Fast, now: number): boolean {
  return fastDuration(fast, now) >= fastGoalMs(fast);
}

/** Dni (początek dnia lokalnego), w których zakończył się post ≥ swojego celu. */
function successfulDays(fasts: readonly Fast[], now: number): Set<number> {
  const days = new Set<number>();
  for (const f of getEndedFasts(fasts)) {
    if (f.endedAt! <= now && reachedGoal(f, now)) days.add(startOfLocalDay(f.endedAt!));
  }
  return days;
}

export type Streaks = { current: number; longest: number };

/**
 * Seria: kolejne dni z udanym postem, licząc wstecz od dziś (albo od wczoraj,
 * jeśli dziś jeszcze nic się nie zakończyło).
 */
export function computeStreaks(fasts: readonly Fast[], now: number): Streaks {
  const days = successfulDays(fasts, now);

  let cursor = startOfLocalDay(now);
  if (!days.has(cursor)) cursor = startOfLocalDay(addLocalDays(cursor, -1));
  let current = 0;
  while (days.has(cursor)) {
    current += 1;
    cursor = startOfLocalDay(addLocalDays(cursor, -1));
  }

  const sorted = [...days].sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const day of sorted) {
    run = prev !== null && localDayDiff(prev, day) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = day;
  }
  return { current, longest: Math.max(longest, current) };
}

export type WeekBarStatus = 'reached' | 'below' | 'ongoing' | 'empty';

export type WeekBar = {
  dayStart: number;
  /** długość postu w godzinach (przypisana do dnia zakończenia) */
  hours: number | null;
  status: WeekBarStatus;
  isToday: boolean;
};

/** Bieżący tydzień pon–niedz. Dzień bez zakończonego postu, ale z trwającym – „ongoing”. */
export function computeWeekBars(fasts: readonly Fast[], now: number): WeekBar[] {
  const weekStart = startOfLocalWeek(now);
  const todayStart = startOfLocalDay(now);
  const ended = getEndedFasts(fasts);
  const active = getActiveFast(fasts);

  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = startOfLocalDay(addLocalDays(weekStart, i));
    const dayEnd = startOfLocalDay(addLocalDays(weekStart, i + 1));
    const isToday = dayStart === todayStart;
    const dayFasts = ended.filter((f) => f.endedAt! >= dayStart && f.endedAt! < dayEnd);

    if (dayFasts.length > 0) {
      const best = dayFasts.reduce((a, b) => (fastDuration(b, now) > fastDuration(a, now) ? b : a));
      return {
        dayStart,
        hours: fastDuration(best, now) / HOUR,
        status: reachedGoal(best, now) ? 'reached' : 'below',
        isToday,
      };
    }
    if (isToday && active) {
      return { dayStart, hours: fastDuration(active, now) / HOUR, status: 'ongoing', isToday };
    }
    return { dayStart, hours: null, status: 'empty', isToday };
  });
}

export type PeriodStats = {
  /** zakończone posty w okresie */
  total: number;
  /** z nich ≥ celu */
  reached: number;
  averageMs: number | null;
  longestMs: number | null;
};

/** Statystyki z ostatnich `days` dni (łącznie z dzisiejszym). */
export function computePeriodStats(fasts: readonly Fast[], now: number, days = 28): PeriodStats {
  const from = startOfLocalDay(addLocalDays(now, -(days - 1)));
  const inRange = getEndedFasts(fasts).filter((f) => f.endedAt! >= from && f.endedAt! <= now);
  if (inRange.length === 0) return { total: 0, reached: 0, averageMs: null, longestMs: null };
  const durations = inRange.map((f) => fastDuration(f, now));
  return {
    total: inRange.length,
    reached: inRange.filter((f) => reachedGoal(f, now)).length,
    averageMs: durations.reduce((a, b) => a + b, 0) / durations.length,
    longestMs: Math.max(...durations),
  };
}

export function recentFasts(fasts: readonly Fast[], limit = 20): Fast[] {
  return getEndedFasts(fasts).slice(0, limit);
}
