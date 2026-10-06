'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';
import { useSettings } from '@/components/providers/SettingsProvider';
import { IconInfo } from '@/components/ui/icons';
import { ListGroup, Notice, SectionLabel } from '@/components/ui/layout';
import { Switch } from '@/components/ui/Switch';
import { updateSettings } from '@/lib/db/repo';
import type { NotificationPreferences } from '@/lib/domain/types';
import { getNotificationScheduler, type PermissionState } from '@/lib/notifications/scheduler';
import { isStandalone, usePlatform } from '@/lib/pwa/install';

type Key = keyof NotificationPreferences;
type NoticeKind = 'denied' | 'unsupported' | 'ios';

const ITEMS = [
  { key: 'beforeEnd', title: 'notifBeforeEnd', sub: 'notifBeforeEndSub' },
  { key: 'end', title: 'notifEnd', sub: 'notifEndSub' },
  { key: 'eatingWindowEnd', title: 'notifEatingEnd', sub: 'notifEatingEndSub' },
  { key: 'water', title: 'notifWater', sub: 'notifWaterSub' },
] as const satisfies ReadonlyArray<{ key: Key; title: string; sub: string }>;

function subscribePermission(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  window.addEventListener('focus', onChange);
  return () => {
    document.removeEventListener('visibilitychange', onChange);
    window.removeEventListener('focus', onChange);
  };
}

function readPermission(): PermissionState {
  return getNotificationScheduler().permission();
}

export function NotificationsSection() {
  const t = useTranslations('settings');
  const { settings } = useSettings();
  const platform = usePlatform();
  const permission = useSyncExternalStore<PermissionState | null>(subscribePermission, readPermission, () => null);
  const [notice, setNotice] = useState<NoticeKind | null>(null);

  const anyEnabled = Object.values(settings.notifications).some(Boolean);
  const shownNotice: NoticeKind | null = notice ?? (anyEnabled && permission === 'denied' ? 'denied' : null);

  const toggle = async (key: Key, value: boolean) => {
    if (value) {
      const scheduler = getNotificationScheduler();
      let state = scheduler.permission();
      if (state === 'unsupported') {
        setNotice(platform === 'ios' && !isStandalone() ? 'ios' : 'unsupported');
        return;
      }
      if (state !== 'granted') state = await scheduler.requestPermission();
      if (state !== 'granted') {
        setNotice(platform === 'ios' && !isStandalone() ? 'ios' : 'denied');
        return;
      }
    }
    setNotice(null);
    await updateSettings({ notifications: { ...settings.notifications, [key]: value } });
  };

  return (
    <section aria-labelledby="notif-title" className="flex flex-col gap-1.5">
      <SectionLabel id="notif-title">{t('notifications')}</SectionLabel>
      <ListGroup>
        {ITEMS.map((item) => (
          <div key={item.key} className="flex min-h-14 items-center justify-between gap-3 py-1.5 pr-3 pl-4">
            <div className="flex min-w-0 flex-col gap-px">
              <span id={`notif-${item.key}`} className="text-sm font-bold">
                {t(item.title)}
              </span>
              <span id={`notif-${item.key}-sub`} className="text-xs text-muted">
                {t(item.sub)}
              </span>
            </div>
            <Switch
              checked={settings.notifications[item.key]}
              onChange={(value) => void toggle(item.key, value)}
              labelledBy={`notif-${item.key}`}
              describedBy={`notif-${item.key}-sub`}
            />
          </div>
        ))}
      </ListGroup>
      {shownNotice ? (
        <Notice role="status" icon={<IconInfo size={20} className="text-water-text" />}>
          {shownNotice === 'ios' ? (
            <>
              {t('notifIos')}{' '}
              <Link href="/install" className="font-bold text-ink">
                {t('notifIosLink')}
              </Link>
            </>
          ) : shownNotice === 'denied' ? (
            t('notifDenied')
          ) : (
            t('notifUnsupported')
          )}
        </Notice>
      ) : anyEnabled ? (
        <p className="m-0 px-1 text-xs leading-[1.45] text-muted">{t('notifLimits')}</p>
      ) : null}
    </section>
  );
}
