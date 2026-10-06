import { DAY } from './time';
import type { WeightEntry } from './types';

export const KG_MIN = 20;
export const KG_MAX = 400;

export function sortWeightsAsc(entries: readonly WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) => a.at - b.at);
}

export function latestWeight(entries: readonly WeightEntry[]): WeightEntry | undefined {
  const sorted = sortWeightsAsc(entries);
  return sorted[sorted.length - 1];
}

/** Pomiar poprzedzający najnowszy. */
export function previousWeight(entries: readonly WeightEntry[]): WeightEntry | undefined {
  const sorted = sortWeightsAsc(entries);
  return sorted.length >= 2 ? sorted[sorted.length - 2] : undefined;
}

/**
 * Zmiana wagi w ostatnich `days` dniach: najnowszy pomiar minus stan sprzed okresu
 * (ostatni pomiar sprzed okna, a gdy go nie ma – pierwszy pomiar w oknie).
 */
export function weightChangeOverDays(entries: readonly WeightEntry[], now: number, days = 30): number | null {
  const sorted = sortWeightsAsc(entries.filter((e) => e.at <= now));
  const latest = sorted[sorted.length - 1];
  if (!latest) return null;
  const windowStart = now - days * DAY;
  const before = sorted.filter((e) => e.at <= windowStart);
  const baseline = before[before.length - 1] ?? sorted.find((e) => e.at >= windowStart);
  if (!baseline || baseline.id === latest.id) return null;
  return roundKg(latest.kg - baseline.kg);
}

/** Punkty do linii trendu (ostatnie `days` dni). */
export function weightTrend(entries: readonly WeightEntry[], now: number, days = 30): WeightEntry[] {
  const windowStart = now - days * DAY;
  return sortWeightsAsc(entries.filter((e) => e.at >= windowStart && e.at <= now));
}

export function resolveStartWeight(
  startWeightKg: number | undefined,
  entries: readonly WeightEntry[],
): number | undefined {
  return startWeightKg ?? sortWeightsAsc(entries)[0]?.kg;
}

/** Postęp 0..1 od wagi startowej do docelowej (działa też dla celu „przytyć”). */
export function weightGoalProgress(
  start: number | undefined,
  goal: number | undefined,
  current: number | undefined,
): number | null {
  if (start === undefined || goal === undefined || current === undefined) return null;
  if (start === goal) return current === goal ? 1 : 0;
  return Math.min(1, Math.max(0, (current - start) / (goal - start)));
}

export function roundKg(kg: number): number {
  return Math.round(kg * 10) / 10;
}

/** Akceptuje „82,4” i „82.4”. Zwraca null dla pustych/niepoprawnych/spoza zakresu. */
export function parseKg(input: string): number | null {
  const normalized = input.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(normalized)) return null;
  const kg = Number(normalized);
  if (!Number.isFinite(kg) || kg < KG_MIN || kg > KG_MAX) return null;
  return roundKg(kg);
}

export type SparklineGeometry = {
  points: [number, number][];
  last: [number, number];
};

/** Geometria linii trendu w układzie width×height (oś X = czas, oś Y = kg). */
export function sparklineGeometry(
  entries: readonly WeightEntry[],
  size: { width: number; height: number; pad: number },
): SparklineGeometry | null {
  if (entries.length === 0) return null;
  const { width, height, pad } = size;
  const times = entries.map((e) => e.at);
  const kgs = entries.map((e) => e.kg);
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const minKg = Math.min(...kgs);
  const maxKg = Math.max(...kgs);
  const range = Math.max(maxKg - minKg, 0.6);
  const mid = (minKg + maxKg) / 2;
  const lo = mid - (range / 2) * 1.1;
  const hi = mid + (range / 2) * 1.1;
  const points = entries.map<[number, number]>((e) => {
    const x = maxT === minT ? width - pad : pad + ((e.at - minT) / (maxT - minT)) * (width - 2 * pad);
    const y = pad + ((hi - e.kg) / (hi - lo)) * (height - 2 * pad);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  });
  return { points, last: points[points.length - 1] };
}
