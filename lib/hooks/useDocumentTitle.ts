'use client';

import { useEffect } from 'react';

/**
 * Tytuł karty w bieżącym języku. Strony są statyczne (metadata po polsku), a Next potrafi
 * nadpisać tytuł po nawigacji, więc pilnujemy go obserwatorem <head>.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const desired = title === 'Posto' ? 'Posto' : `${title} · Posto`;
    const apply = () => {
      if (document.title !== desired) document.title = desired;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
}
