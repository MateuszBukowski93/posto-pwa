'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDb } from '@/lib/db';
import { DAY } from '@/lib/domain/time';
import type { Fast, WaterEntry, WeightEntry } from '@/lib/domain/types';

/** undefined = wczytywanie */
export function useFasts(): Fast[] | undefined {
  return useLiveQuery(() => getDb().fasts.toArray(), []);
}

export function useWeights(): WeightEntry[] | undefined {
  return useLiveQuery(() => getDb().weights.orderBy('at').toArray(), []);
}

/** Wpisy wody od początku wczorajszego dnia – wystarczą do licznika „dziś”. */
export function useRecentWater(dayStart: number | null): WaterEntry[] | undefined {
  return useLiveQuery<WaterEntry[] | undefined>(
    () =>
      dayStart === null
        ? undefined
        : getDb()
            .water.where('at')
            .aboveOrEqual(dayStart - DAY)
            .toArray(),
    [dayStart],
  );
}
