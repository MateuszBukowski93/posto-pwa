import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

type Clock = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => number;
};

const clocks = new Map<number, Clock>();

function createClock(intervalMs: number): Clock {
  let now = Date.now();
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
  let appState: ReturnType<typeof AppState.addEventListener> | undefined;

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      if (listeners.size === 1) {
        now = Date.now();
        schedule();
        // po powrocie z tła od razu pokaż właściwy czas (timery JS są wtedy wstrzymane)
        appState = AppState.addEventListener('change', (state) => {
          if (state !== 'active') return;
          clearTimeout(timer);
          tick();
        });
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) {
          clearTimeout(timer);
          appState?.remove();
        }
      };
    },
    getSnapshot: () => (listeners.size > 0 ? now : Math.floor(Date.now() / intervalMs) * intervalMs),
  };
}

/**
 * Bieżący czas odświeżany co `intervalMs`. Czas liczony zawsze z Date.now(),
 * więc po zamknięciu i ponownym otwarciu aplikacji timer pokazuje poprawną wartość.
 */
export function useNow(intervalMs = 1000): number {
  let clock = clocks.get(intervalMs);
  if (!clock) {
    clock = createClock(intervalMs);
    clocks.set(intervalMs, clock);
  }
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getSnapshot);
}
