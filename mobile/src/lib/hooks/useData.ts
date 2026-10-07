import { useEffect, useEffectEvent, useState } from 'react';
import { subscribe, type Table } from '@/lib/db';
import { readFasts, readWaterSince, readWeights } from '@/lib/db/repo';
import { DAY } from '@/lib/domain/time';
import type { Fast, WaterEntry, WeightEntry } from '@/lib/domain/types';

/**
 * Odpowiednik useLiveQuery z Dexie: wynik zapytania odświeżany po każdym zapisie
 * do podanych tabel. `key` identyfikuje zapytanie (zmiana = nowe zapytanie). undefined = wczytywanie.
 */
function useLiveQuery<T>(tables: readonly Table[], query: (() => Promise<T>) | null, key: string): T | undefined {
  const [state, setState] = useState<{ key: string; value: T } | undefined>(undefined);
  const runQuery = useEffectEvent(() => (query ? query() : null));
  const enabled = query !== null;
  const tablesKey = tables.join(',');

  useEffect(() => {
    if (!enabled) return;
    let version = 0;
    let active = true;
    const load = () => {
      const current = ++version;
      runQuery()?.then(
        (value) => {
          // starsze zapytanie nie nadpisze nowszego wyniku
          if (active && current === version) setState({ key, value });
        },
        () => undefined,
      );
    };
    load();
    const unsubscribe = subscribe(tablesKey.split(',') as Table[], load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [key, enabled, tablesKey]);

  return state?.key === key ? state.value : undefined;
}

export function useFasts(): Fast[] | undefined {
  return useLiveQuery(['fasts'], readFasts, 'fasts');
}

export function useWeights(): WeightEntry[] | undefined {
  return useLiveQuery(['weights'], readWeights, 'weights');
}

/** Wpisy wody od początku wczorajszego dnia – wystarczą do licznika „dziś”. */
export function useRecentWater(dayStart: number | null): WaterEntry[] | undefined {
  return useLiveQuery(
    ['water'],
    dayStart === null ? null : () => readWaterSince(dayStart - DAY),
    `water:${dayStart ?? ''}`,
  );
}
