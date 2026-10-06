/**
 * Arytmetyka czasu. Wszystkie znaczniki to epoch ms (UTC). Operacje „kalendarzowe”
 * (początek dnia, przesunięcie o dzień, godzina zegarowa) liczone są w strefie lokalnej,
 * więc przejście na czas letni/zimowy nie psuje ani długości postu, ani granic dnia.
 */

export const SECOND = 1_000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export function pad2(n: number): string {
  return String(Math.trunc(n)).padStart(2, '0');
}

export function startOfLocalDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Ten sam moment zegarowy przesunięty o `days` dni kalendarzowych (bezpieczne przy DST). */
export function addLocalDays(ts: number, days: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Liczba dni kalendarzowych między `from` a `to` (np. wczoraj → dziś = 1). */
export function localDayDiff(from: number, to: number): number {
  return Math.round((startOfLocalDay(to) - startOfLocalDay(from)) / DAY);
}

export function localDayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Poniedziałek 00:00 tygodnia, w którym leży `ts`. */
export function startOfLocalWeek(ts: number): number {
  const day = new Date(ts).getDay(); // 0 = niedziela
  const sinceMonday = (day + 6) % 7;
  return startOfLocalDay(addLocalDays(ts, -sinceMonday));
}

export type TimeOfDay = { hours: number; minutes: number };

export function parseTimeOfDay(value: string | null | undefined): TimeOfDay | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function formatTimeOfDay(ts: number): string {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/**
 * Moment o godzinie `time` w dniu przesuniętym o `dayOffset` dni wstecz względem `ts`.
 * Np. atLocalTime(now, 1, '19:00') = wczoraj 19:00.
 */
export function atLocalTime(ts: number, dayOffset: number, time: string): number | null {
  const tod = parseTimeOfDay(time);
  if (!tod) return null;
  const d = new Date(ts);
  d.setDate(d.getDate() - dayOffset);
  d.setHours(tod.hours, tod.minutes, 0, 0);
  return d.getTime();
}

/** Ostatni moment ≤ now o podanej godzinie zegarowej (dziś albo wczoraj). */
export function mostRecentLocalTime(now: number, time: string): number | null {
  const today = atLocalTime(now, 0, time);
  if (today === null) return null;
  return today <= now ? today : atLocalTime(now, 1, time);
}

/** Najbliższy moment > now o podanej godzinie zegarowej (dziś albo jutro). */
export function nextLocalTime(now: number, time: string): number | null {
  const today = atLocalTime(now, 0, time);
  if (today === null) return null;
  return today > now ? today : atLocalTime(now, -1, time);
}

export type DurationParts = { hours: number; minutes: number; seconds: number };

export function splitDuration(ms: number): DurationParts {
  const total = Math.max(0, Math.floor(ms / SECOND));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Czas trwania jako HH:MM:SS (godziny mogą przekroczyć 24). */
export function formatClock(ms: number): string {
  const { hours, minutes, seconds } = splitDuration(ms);
  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

/** Wartość dla <input type="datetime-local"> w strefie lokalnej. */
export function toDateTimeLocal(ts: number): string {
  const d = new Date(ts);
  return `${localDayKey(ts)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function fromDateTimeLocal(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const date = new Date(y, mo - 1, d, h, mi, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}
