import { addLocalDays, startOfLocalDay } from './time';
import type { WaterEntry } from './types';

export const WATER_STEP_ML = 250;

/** Doba lokalna [start, end) zawierająca `now` – licznik zeruje się o północy. */
export function localDayBounds(now: number): [number, number] {
  const start = startOfLocalDay(now);
  return [start, startOfLocalDay(addLocalDays(start, 1))];
}

export function waterEntriesForDay(entries: readonly WaterEntry[], now: number): WaterEntry[] {
  const [start, end] = localDayBounds(now);
  return entries.filter((e) => e.at >= start && e.at < end);
}

export function waterTotalForDay(entries: readonly WaterEntry[], now: number): number {
  return waterEntriesForDay(entries, now).reduce((sum, e) => sum + e.ml, 0);
}

export function lastWaterEntryForDay(entries: readonly WaterEntry[], now: number): WaterEntry | undefined {
  return waterEntriesForDay(entries, now).sort((a, b) => b.at - a.at)[0];
}

export type WaterGlasses = { cells: number; filled: number; columns: number };

/** Siatka „szklanek”: cel / 250 ml, maks. 10 w rzędzie, rzędy równej długości. */
export function waterGlasses(goalMl: number, totalMl: number): WaterGlasses {
  const cells = Math.max(1, Math.round(goalMl / WATER_STEP_ML));
  const filled = Math.min(cells, Math.floor(Math.max(0, totalMl) / WATER_STEP_ML));
  const rows = Math.ceil(cells / 10);
  return { cells, filled, columns: Math.ceil(cells / rows) };
}
