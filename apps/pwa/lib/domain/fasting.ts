import { phaseIndexAt } from './phases';
import type { Protocol } from './protocols';
import { HOUR, nextLocalTime } from './time';
import type { Fast } from './types';

export function getActiveFast(fasts: readonly Fast[]): Fast | undefined {
  // Trwa najwyżej jeden post; gdyby dane były niespójne, bierzemy najnowszy.
  let active: Fast | undefined;
  for (const f of fasts) {
    if (f.endedAt === undefined && (!active || f.startedAt > active.startedAt)) active = f;
  }
  return active;
}

export function getEndedFasts(fasts: readonly Fast[]): Fast[] {
  return fasts
    .filter((f): f is Fast & { endedAt: number } => f.endedAt !== undefined)
    .sort((a, b) => b.endedAt - a.endedAt);
}

export function getLastEndedFast(fasts: readonly Fast[], excludeId?: string): Fast | undefined {
  return getEndedFasts(fasts).find((f) => f.id !== excludeId);
}

export function fastDuration(fast: Fast, now: number): number {
  return Math.max(0, (fast.endedAt ?? now) - fast.startedAt);
}

export function fastGoalMs(fast: Pick<Fast, 'goalHours'>): number {
  return fast.goalHours * HOUR;
}

export function isGoalReached(fast: Fast, now: number): boolean {
  return fastDuration(fast, now) >= fastGoalMs(fast);
}

export type FastingState = {
  kind: 'fasting';
  fast: Fast;
  elapsed: number;
  goalMs: number;
  goalEndsAt: number;
  /** 0..1 – pierwsze okrążenie */
  progress: number;
  /** 0..1 – drugie okrążenie (nadwyżka ponad cel, względem długości celu) */
  overflow: number;
  remaining: number;
  reached: boolean;
  phaseIndex: number;
};

export type EatingState = {
  kind: 'eating';
  lastFast: Fast;
  since: number;
  elapsed: number;
  goalMs: number;
  nextFastAt: number;
  progress: number;
  remaining: number;
};

/** Brak jakiegokolwiek postu – zaraz po onboardingu. */
export type IdleState = {
  kind: 'idle';
  goalMs: number;
  nextFastAt: number | null;
};

export type TimerState = FastingState | EatingState | IdleState;

export function computeTimerState(input: {
  fasts: readonly Fast[];
  now: number;
  protocol: Protocol;
  lastMealTime: string;
}): TimerState {
  const { fasts, now, protocol, lastMealTime } = input;
  const active = getActiveFast(fasts);
  if (active) {
    const elapsed = fastDuration(active, now);
    const goalMs = fastGoalMs(active);
    return {
      kind: 'fasting',
      fast: active,
      elapsed,
      goalMs,
      goalEndsAt: active.startedAt + goalMs,
      progress: goalMs > 0 ? Math.min(elapsed / goalMs, 1) : 1,
      overflow: goalMs > 0 ? Math.min(Math.max(elapsed - goalMs, 0) / goalMs, 1) : 0,
      remaining: Math.max(goalMs - elapsed, 0),
      reached: elapsed >= goalMs,
      phaseIndex: phaseIndexAt(elapsed),
    };
  }

  const lastFast = getLastEndedFast(fasts);
  if (lastFast && lastFast.endedAt !== undefined) {
    // Okno jedzenia: od końca ostatniego postu, cel = 24 − godziny postu bieżącego protokołu.
    const since = lastFast.endedAt;
    const elapsed = Math.max(0, now - since);
    const goalMs = protocol.eatHours * HOUR;
    return {
      kind: 'eating',
      lastFast,
      since,
      elapsed,
      goalMs,
      nextFastAt: since + goalMs,
      progress: goalMs > 0 ? Math.min(elapsed / goalMs, 1) : 1,
      remaining: Math.max(goalMs - elapsed, 0),
    };
  }

  return {
    kind: 'idle',
    goalMs: protocol.fastHours * HOUR,
    nextFastAt: nextLocalTime(now, lastMealTime),
  };
}

export type StartValidation =
  | { ok: true }
  | { ok: false; reason: 'invalid' }
  | { ok: false; reason: 'future' }
  | { ok: false; reason: 'beforePreviousEnd'; previousEndedAt: number };

/** Start postu nie może być w przyszłości ani przed końcem poprzedniego postu. */
export function validateFastStart(
  candidate: number | null,
  ctx: { now: number; previousEndedAt?: number },
): StartValidation {
  if (candidate === null || !Number.isFinite(candidate)) return { ok: false, reason: 'invalid' };
  if (candidate > ctx.now) return { ok: false, reason: 'future' };
  if (ctx.previousEndedAt !== undefined && candidate < ctx.previousEndedAt) {
    return { ok: false, reason: 'beforePreviousEnd', previousEndedAt: ctx.previousEndedAt };
  }
  return { ok: true };
}

export type EndValidation = { ok: true } | { ok: false; reason: 'invalid' | 'future' | 'beforeStart' };

export function validateFastEnd(candidate: number | null, ctx: { now: number; startedAt: number }): EndValidation {
  if (candidate === null || !Number.isFinite(candidate)) return { ok: false, reason: 'invalid' };
  if (candidate > ctx.now) return { ok: false, reason: 'future' };
  if (candidate <= ctx.startedAt) return { ok: false, reason: 'beforeStart' };
  return { ok: true };
}

export type RangeValidation = { ok: true } | { ok: false; reason: 'invalid' | 'future' | 'endBeforeStart' | 'overlap' };

/** Edycja zakończonego postu w historii: koniec po starcie, nie w przyszłości, bez nakładania. */
export function validateFastRange(
  range: { id?: string; startedAt: number | null; endedAt: number | null },
  ctx: { now: number; fasts: readonly Fast[] },
): RangeValidation {
  const { startedAt, endedAt } = range;
  if (startedAt === null || endedAt === null) return { ok: false, reason: 'invalid' };
  if (endedAt > ctx.now || startedAt > ctx.now) return { ok: false, reason: 'future' };
  if (endedAt <= startedAt) return { ok: false, reason: 'endBeforeStart' };
  const overlaps = ctx.fasts.some((f) => {
    if (f.id === range.id) return false;
    const otherEnd = f.endedAt ?? Number.POSITIVE_INFINITY;
    return startedAt < otherEnd && f.startedAt < endedAt;
  });
  return overlaps ? { ok: false, reason: 'overlap' } : { ok: true };
}
