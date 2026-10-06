'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { planNotifications } from '@/lib/domain/notifications';
import { getProtocol } from '@/lib/domain/protocols';
import { useFasts } from '@/lib/hooks/useData';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { getNotificationScheduler } from '@/lib/notifications/scheduler';
import { useSettings } from './SettingsProvider';

/** Przelicza plan powiadomień przy każdej zmianie danych i co minutę. */
export function NotificationsManager() {
  const { settings, loaded } = useSettings();
  const fasts = useFasts();
  const now = useNow(60_000);
  const t = useTranslations('notifications');
  const format = useFormatters();

  useEffect(() => {
    if (!loaded || fasts === undefined || now === null) return;
    const scheduler = getNotificationScheduler();
    const anyEnabled = Object.values(settings.notifications).some(Boolean);
    if (!anyEnabled || scheduler.permission() !== 'granted') {
      scheduler.schedule([]);
      return;
    }
    const plan = planNotifications({
      prefs: settings.notifications,
      fasts,
      protocol: getProtocol(settings.protocolId),
      now,
    });
    scheduler.schedule(
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
  }, [loaded, fasts, now, settings.notifications, settings.protocolId, t, format]);

  return null;
}
