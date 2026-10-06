import type { Settings } from '@/lib/domain/types';

/**
 * Bieżące ustawienia w pamięci. Repozytorium aktualizuje je synchronicznie po każdym zapisie,
 * więc np. przekierowanie po onboardingu widzi już `onboardingDone = true`.
 * undefined = jeszcze nie wczytane.
 */
let current: Settings | undefined;
const listeners = new Set<() => void>();

export const settingsStore = {
  get: (): Settings | undefined => current,
  set(next: Settings): void {
    current = next;
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
