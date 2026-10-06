'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
  interface Window {
    /** ustawiane przez skrypt startowy (lib/bootScript.ts) */
    __postoInstallPrompt?: BeforeInstallPromptEvent | null;
  }
  interface Navigator {
    standalone?: boolean;
  }
}

// ---------- beforeinstallprompt ----------

const promptListeners = new Set<() => void>();
let promptInit = false;

function emitPrompt() {
  promptListeners.forEach((l) => l());
}

function initPrompt() {
  if (promptInit) return;
  promptInit = true;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    window.__postoInstallPrompt = event as BeforeInstallPromptEvent;
    emitPrompt();
  });
  window.addEventListener('appinstalled', () => {
    window.__postoInstallPrompt = null;
    emitPrompt();
  });
}

function subscribePrompt(listener: () => void) {
  initPrompt();
  promptListeners.add(listener);
  return () => promptListeners.delete(listener);
}

/** Przycisk „Zainstaluj” na Androidzie/desktopie (Chrome, Edge). */
export function useInstallPrompt() {
  const event = useSyncExternalStore(
    subscribePrompt,
    () => window.__postoInstallPrompt ?? null,
    () => null,
  );
  const promptInstall = useCallback(async () => {
    const current = window.__postoInstallPrompt;
    if (!current) return 'unavailable' as const;
    await current.prompt();
    const choice = await current.userChoice;
    window.__postoInstallPrompt = null;
    emitPrompt();
    return choice.outcome;
  }, []);
  return { canPrompt: event !== null, promptInstall };
}

// ---------- tryb standalone ----------

const STANDALONE_QUERY = '(display-mode: standalone)';

function subscribeStandalone(listener: () => void) {
  const media = window.matchMedia(STANDALONE_QUERY);
  media.addEventListener('change', listener);
  window.addEventListener('appinstalled', listener);
  return () => {
    media.removeEventListener('change', listener);
    window.removeEventListener('appinstalled', listener);
  };
}

export function isStandalone(): boolean {
  return window.matchMedia(STANDALONE_QUERY).matches || navigator.standalone === true;
}

/** null na serwerze/podczas hydratacji. */
export function useIsStandalone(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribeStandalone, isStandalone, () => null);
}

// ---------- platforma ----------

export type Platform = 'ios' | 'android' | 'other';

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  // iPadOS udaje Maca
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

const noopSubscribe = () => () => {};

export function usePlatform(): Platform | null {
  return useSyncExternalStore<Platform | null>(noopSubscribe, detectPlatform, () => null);
}
