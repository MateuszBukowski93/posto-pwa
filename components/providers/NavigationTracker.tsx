'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

let navigatedInApp = false;

/** Czy w tej karcie była już nawigacja wewnątrz aplikacji (wtedy „wstecz” = history.back()). */
export function hasInAppHistory(): boolean {
  return navigatedInApp;
}

export function NavigationTracker() {
  const pathname = usePathname();
  const first = useRef<string | null>(null);

  useEffect(() => {
    if (first.current === null) {
      first.current = pathname;
      return;
    }
    if (pathname !== first.current) navigatedInApp = true;
  }, [pathname]);

  return null;
}
