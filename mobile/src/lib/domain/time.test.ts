import { describe, expect, it } from 'vitest';
import {
  atLocalTime,
  formatClock,
  fromDateTimeLocal,
  HOUR,
  localDayDiff,
  mostRecentLocalTime,
  nextLocalTime,
  parseTimeOfDay,
  splitDuration,
  startOfLocalWeek,
  toDateTimeLocal,
} from './time';

const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min).getTime();

describe('time', () => {
  it('jest uruchamiany w strefie Europe/Warsaw', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('Europe/Warsaw');
  });

  it('atLocalTime liczy „wczoraj 19:00” względem teraz', () => {
    const now = at(2026, 10, 5, 9, 0);
    expect(atLocalTime(now, 1, '19:00')).toBe(at(2026, 10, 4, 19, 0));
    expect(atLocalTime(now, 0, '07:30')).toBe(at(2026, 10, 5, 7, 30));
    expect(atLocalTime(now, 2, '23:59')).toBe(at(2026, 10, 3, 23, 59));
    expect(atLocalTime(now, 0, 'bzdura')).toBeNull();
  });

  it('post przez noc zmiany czasu na zimowy trwa realnie o godzinę dłużej', () => {
    // 25.10.2026 o 3:00 zegary cofają się na 2:00
    const start = at(2026, 10, 24, 20, 0);
    const end = at(2026, 10, 25, 12, 0);
    expect(end - start).toBe(17 * HOUR);
    expect(formatClock(end - start)).toBe('17:00:00');
    // „wczoraj 20:00” liczone w niedzielę po zmianie czasu
    expect(atLocalTime(end, 1, '20:00')).toBe(start);
    expect(localDayDiff(start, end)).toBe(1);
  });

  it('post przez noc zmiany czasu na letni trwa realnie o godzinę krócej', () => {
    // 29.03.2026 o 2:00 zegary przesuwają się na 3:00
    const start = at(2026, 3, 28, 20, 0);
    const end = at(2026, 3, 29, 12, 0);
    expect(end - start).toBe(15 * HOUR);
  });

  it('startOfLocalWeek zaczyna tydzień w poniedziałek', () => {
    expect(startOfLocalWeek(at(2026, 10, 5, 15))).toBe(at(2026, 10, 5)); // poniedziałek
    expect(startOfLocalWeek(at(2026, 10, 11, 23, 59))).toBe(at(2026, 10, 5)); // niedziela
    expect(startOfLocalWeek(at(2026, 10, 25, 12))).toBe(at(2026, 10, 19)); // niedziela ze zmianą czasu
  });

  it('mostRecentLocalTime i nextLocalTime', () => {
    const now = at(2026, 10, 5, 9, 0);
    expect(mostRecentLocalTime(now, '20:00')).toBe(at(2026, 10, 4, 20));
    expect(mostRecentLocalTime(now, '08:00')).toBe(at(2026, 10, 5, 8));
    expect(nextLocalTime(now, '20:00')).toBe(at(2026, 10, 5, 20));
    expect(nextLocalTime(now, '08:00')).toBe(at(2026, 10, 6, 8));
  });

  it('parseTimeOfDay waliduje format', () => {
    expect(parseTimeOfDay('20:00')).toEqual({ hours: 20, minutes: 0 });
    expect(parseTimeOfDay('7:05')).toEqual({ hours: 7, minutes: 5 });
    expect(parseTimeOfDay('24:00')).toBeNull();
    expect(parseTimeOfDay('')).toBeNull();
  });

  it('splitDuration i formatClock', () => {
    expect(splitDuration(14 * HOUR + 32 * 60_000 + 8_000)).toEqual({ hours: 14, minutes: 32, seconds: 8 });
    expect(formatClock(-5)).toBe('00:00:00');
    expect(formatClock(30 * HOUR + 1_000)).toBe('30:00:01');
  });

  it('datetime-local w obie strony', () => {
    const ts = at(2026, 10, 5, 7, 10);
    expect(toDateTimeLocal(ts)).toBe('2026-10-05T07:10');
    expect(fromDateTimeLocal('2026-10-05T07:10')).toBe(ts);
    expect(fromDateTimeLocal('nie-data')).toBeNull();
  });
});
