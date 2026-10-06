import { BASE_PATH, STORAGE_KEYS } from '@/lib/config';
import { DAY, MINUTE } from '@/lib/domain/time';

export type ScheduledNotification = {
  id: string;
  at: number;
  title: string;
  body: string;
};

export type PermissionState = NotificationPermission | 'unsupported';

/**
 * Abstrakcja powiadomień. Etap 1: lokalne powiadomienia z service workera, planowane,
 * gdy aplikacja jest otwarta lub w tle. Etap 2 (Web Push z serwera) może podmienić
 * implementację bez zmian w UI.
 */
export interface NotificationScheduler {
  permission(): PermissionState;
  requestPermission(): Promise<PermissionState>;
  /** Zastępuje cały dotychczasowy plan. */
  schedule(items: ScheduledNotification[]): void;
  dispose(): void;
}

/** Spóźnione (np. telefon uśpił kartę) powiadomienie pokażemy, jeśli minęło mniej niż tyle. */
const CATCH_UP_MS = 15 * MINUTE;
/** Limit setTimeout (~24,8 dnia). */
const MAX_TIMEOUT = 2 ** 31 - 1;

function readShown(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notified);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function markShown(id: string): void {
  try {
    const now = Date.now();
    const shown = readShown();
    shown[id] = now;
    for (const [key, ts] of Object.entries(shown)) if (now - ts > 3 * DAY) delete shown[key];
    localStorage.setItem(STORAGE_KEYS.notified, JSON.stringify(shown));
  } catch {
    // brak storage – w najgorszym razie powiadomienie pokaże się ponownie
  }
}

export class LocalNotificationScheduler implements NotificationScheduler {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private items: ScheduledNotification[] = [];

  constructor() {
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  permission(): PermissionState {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission(): Promise<PermissionState> {
    if (this.permission() === 'unsupported') return 'unsupported';
    const result = await Notification.requestPermission();
    this.reschedule();
    return result;
  }

  schedule(items: ScheduledNotification[]): void {
    this.items = items;
    this.reschedule();
  }

  dispose(): void {
    this.clearTimers();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private onVisibility = () => {
    if (document.visibilityState === 'visible') this.reschedule();
  };

  private clearTimers() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  private reschedule() {
    this.clearTimers();
    if (this.permission() !== 'granted') return;
    const now = Date.now();
    const shown = readShown();
    for (const item of this.items) {
      if (shown[item.id]) continue;
      const delay = item.at - now;
      if (delay <= 0) {
        if (-delay <= CATCH_UP_MS) void this.show(item);
        continue;
      }
      if (delay > MAX_TIMEOUT) continue;
      this.timers.set(
        item.id,
        setTimeout(() => void this.show(item), delay),
      );
    }
  }

  private async show(item: ScheduledNotification) {
    if (readShown()[item.id]) return;
    markShown(item.id);
    const options: NotificationOptions = {
      body: item.body,
      tag: item.id,
      icon: `${BASE_PATH}/icons/icon-192.png`,
      badge: `${BASE_PATH}/icons/badge-72.png`,
      data: { url: `${BASE_PATH}/` },
    };
    try {
      const registration = await navigator.serviceWorker.getRegistration(`${BASE_PATH}/`);
      if (registration) {
        await registration.showNotification(item.title, options);
        return;
      }
      new Notification(item.title, options);
    } catch {
      // np. brak zgody cofniętej w międzyczasie
    }
  }
}

let scheduler: NotificationScheduler | null = null;

export function getNotificationScheduler(): NotificationScheduler {
  scheduler ??= new LocalNotificationScheduler();
  return scheduler;
}
