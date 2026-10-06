import { getActiveFast, getLastEndedFast } from './fasting';
import type { Protocol } from './protocols';
import { atLocalTime, DAY, HOUR, localDayKey, MINUTE, pad2 } from './time';
import type { Fast, NotificationPreferences } from './types';

export type NotificationKind = 'beforeEnd' | 'end' | 'eatingWindowEnd' | 'water';

export type PlannedNotification = {
  /** stabilny identyfikator – ten sam termin nie zostanie pokazany dwa razy */
  id: string;
  kind: NotificationKind;
  at: number;
  goalHours?: number;
  fastStartAt?: number;
};

export const BEFORE_END_LEAD_MS = 30 * MINUTE;
export const EATING_END_LEAD_MS = HOUR;
export const WATER_REMINDER_HOURS = [8, 10, 12, 14, 16, 18, 20] as const;

/** Plan powiadomień na najbliższe `horizonMs` (domyślnie dobę). Czysta funkcja. */
export function planNotifications(input: {
  prefs: NotificationPreferences;
  fasts: readonly Fast[];
  protocol: Protocol;
  now: number;
  horizonMs?: number;
}): PlannedNotification[] {
  const { prefs, fasts, protocol, now, horizonMs = DAY } = input;
  const within = (at: number) => at > now && at <= now + horizonMs;
  const out: PlannedNotification[] = [];

  const active = getActiveFast(fasts);
  if (active) {
    const goalEnd = active.startedAt + active.goalHours * HOUR;
    const before = goalEnd - BEFORE_END_LEAD_MS;
    if (prefs.beforeEnd && within(before)) {
      out.push({ id: `beforeEnd:${active.id}:${goalEnd}`, kind: 'beforeEnd', at: before, goalHours: active.goalHours });
    }
    if (prefs.end && within(goalEnd)) {
      out.push({ id: `end:${active.id}:${goalEnd}`, kind: 'end', at: goalEnd, goalHours: active.goalHours });
    }
  } else if (prefs.eatingWindowEnd) {
    const last = getLastEndedFast(fasts);
    if (last?.endedAt !== undefined) {
      const nextStart = last.endedAt + protocol.eatHours * HOUR;
      const at = nextStart - EATING_END_LEAD_MS;
      if (within(at)) {
        out.push({
          id: `eatingWindowEnd:${last.id}:${nextStart}`,
          kind: 'eatingWindowEnd',
          at,
          fastStartAt: nextStart,
        });
      }
    }
  }

  if (prefs.water) {
    for (const dayOffset of [0, -1]) {
      for (const hour of WATER_REMINDER_HOURS) {
        const at = atLocalTime(now, dayOffset, `${pad2(hour)}:00`);
        if (at !== null && within(at)) {
          out.push({ id: `water:${localDayKey(at)}:${hour}`, kind: 'water', at });
        }
      }
    }
  }

  return out.sort((a, b) => a.at - b.at);
}
