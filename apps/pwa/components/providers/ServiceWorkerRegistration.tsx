'use client';

import { useEffect } from 'react';
import { BASE_PATH } from '@/lib/config';

/** Rejestruje public/sw.js (generowany po buildzie) – tylko w wersji produkcyjnej. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/`, updateViaCache: 'none' })
      .catch(() => {
        // brak SW = brak trybu offline, aplikacja działa dalej
      });
  }, []);
  return null;
}
