'use client';

import { useSyncExternalStore } from 'react';

type Clock = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => number;
};

const clocks = new Map<number, Clock>();

function createClock(intervalMs: number): Clock {
  let now = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());
  const schedule = () => {
    // wyrównanie do pełnych sekund/minut, żeby zegar nie „pływał”
    timer = setTimeout(tick, intervalMs - (Date.now() % intervalMs));
  };
  const tick = () => {
    now = Date.now();
    emit();
    schedule();
  };
  const onVisible = () => {
    if (document.visibilityState === 'visible') {
      now = Date.now();
      emit();
    }
  };

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      if (listeners.size === 1) {
        now = Date.now();
        schedule();
        document.addEventListener('visibilitychange', onVisible);
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) {
          clearTimeout(timer);
          document.removeEventListener('visibilitychange', onVisible);
        }
      };
    },
    // Bez subskrybentów zwracamy czas zaokrąglony do interwału – stabilny między wywołaniami.
    getSnapshot: () => (listeners.size > 0 ? now : Math.floor(Date.now() / intervalMs) * intervalMs),
  };
}

const getServerSnapshot = () => null;

/**
 * Bieżący czas odświeżany co `intervalMs`. Na serwerze i podczas hydratacji zwraca null,
 * więc wartości zależne od czasu renderują się dopiero po zamontowaniu (bez hydration mismatch).
 */
export function useNow(intervalMs = 1000): number | null {
  let clock = clocks.get(intervalMs);
  if (!clock) {
    clock = createClock(intervalMs);
    clocks.set(intervalMs, clock);
  }
  return useSyncExternalStore<number | null>(clock.subscribe, clock.getSnapshot, getServerSnapshot);
}
