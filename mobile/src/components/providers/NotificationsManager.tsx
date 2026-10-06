import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { useTranslations } from 'use-intl';
import { NOTIFICATION_HORIZON_MS, planNotifications } from '@/lib/domain/notifications';
import { getProtocol } from '@/lib/domain/protocols';
import { useFasts } from '@/lib/hooks/useData';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { ensureNotificationChannel, getNotificationScheduler } from '@/lib/notifications/scheduler';
import { useSettings } from './SettingsProvider';

// Przy otwartej aplikacji też pokazujemy baner (np. „Cel osiągnięty” na ekranie timera).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Przelicza plan powiadomień przy każdej zmianie danych i co minutę, i zapisuje go w systemie. */
export function NotificationsManager() {
  const { settings, loaded } = useSettings();
  const fasts = useFasts();
  const now = useNow(60_000);
  const t = useTranslations('notifications');
  const format = useFormatters();
  const channelName = t('channelName');

  useEffect(() => {
    void ensureNotificationChannel(channelName).catch(() => undefined);
  }, [channelName]);

  useEffect(() => {
    if (!loaded || fasts === undefined) return;
    const scheduler = getNotificationScheduler();
    const anyEnabled = Object.values(settings.notifications).some(Boolean);
    let cancelled = false;
    void (async () => {
      const permitted = anyEnabled && (await scheduler.permission()) === 'granted';
      if (cancelled) return;
      if (!permitted) {
        await scheduler.schedule([]);
        return;
      }
      const plan = planNotifications({
        prefs: settings.notifications,
        fasts,
        protocol: getProtocol(settings.protocolId),
        now,
        horizonMs: NOTIFICATION_HORIZON_MS,
      });
      await scheduler.schedule(
        plan.map((item) => {
          const params = { goal: item.goalHours ?? 0, time: item.fastStartAt ? format.time(item.fastStartAt) : '' };
          return {
            id: item.id,
            at: item.at,
            title: t(`${item.kind}.title`, params),
            body: t(`${item.kind}.body`, params),
          };
        }),
      );
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [loaded, fasts, now, settings.notifications, settings.protocolId, t, format]);

  return null;
}
