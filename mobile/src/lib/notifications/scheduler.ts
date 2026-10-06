import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNEL_ID } from '@/lib/config';

export type ScheduledNotification = {
  id: string;
  at: number;
  title: string;
  body: string;
};

export type PermissionState = 'granted' | 'denied' | 'undetermined';

/**
 * Abstrakcja powiadomień (jak w wersji PWA). Implementacja natywna planuje lokalne powiadomienia
 * w systemie – pojawiają się także przy zamkniętej aplikacji, bez serwera.
 */
export interface NotificationScheduler {
  permission(): Promise<PermissionState>;
  requestPermission(): Promise<PermissionState>;
  /** Zastępuje cały dotychczasowy plan. */
  schedule(items: ScheduledNotification[]): Promise<void>;
}

function toState(response: Notifications.NotificationPermissionsStatus): PermissionState {
  const ios = response.ios?.status;
  if (
    response.granted ||
    ios === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    ios === Notifications.IosAuthorizationStatus.EPHEMERAL
  ) {
    return 'granted';
  }
  // Android: po odmowie z „nie pytaj ponownie” zostają tylko ustawienia systemu
  if (response.status === 'denied' || !response.canAskAgain) return 'denied';
  return 'undetermined';
}

/** Kanał Androida jest potrzebny, zanim system pokaże prośbę o zgodę (Android 13+). */
export async function ensureNotificationChannel(name: string): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
  });
}

class ExpoNotificationScheduler implements NotificationScheduler {
  /** podpis ostatnio zaplanowanego planu – bez zmian nie dotykamy systemu */
  private signature: string | null = null;
  private queue: Promise<void> = Promise.resolve();

  async permission(): Promise<PermissionState> {
    return toState(await Notifications.getPermissionsAsync());
  }

  async requestPermission(): Promise<PermissionState> {
    const current = await Notifications.getPermissionsAsync();
    if (toState(current) !== 'undetermined') return toState(current);
    return toState(
      await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } }),
    );
  }

  schedule(items: ScheduledNotification[]): Promise<void> {
    const signature = JSON.stringify(items.map((i) => [i.id, i.at, i.title, i.body]));
    // kolejka: kolejne plany nie mieszają się, gdy poprzedni jeszcze się zapisuje
    this.queue = this.queue.then(async () => {
      if (signature === this.signature) return;
      this.signature = signature;
      await Notifications.cancelAllScheduledNotificationsAsync();
      for (const item of items) {
        if (item.at <= Date.now()) continue;
        await Notifications.scheduleNotificationAsync({
          identifier: item.id,
          content: { title: item.title, body: item.body },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(item.at),
            channelId: NOTIFICATION_CHANNEL_ID,
          },
        });
      }
    });
    this.queue = this.queue.catch(() => {
      // np. brak zgody cofniętej w międzyczasie – kolejna zmiana planu spróbuje ponownie
      this.signature = null;
    });
    return this.queue;
  }
}

let scheduler: NotificationScheduler | null = null;

export function getNotificationScheduler(): NotificationScheduler {
  scheduler ??= new ExpoNotificationScheduler();
  return scheduler;
}
