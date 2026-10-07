import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { IconInfo } from '@/components/ui/icons';
import { ListGroup, Notice, SectionLabel } from '@/components/ui/layout';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { updateSettings } from '@/lib/db/repo';
import type { NotificationPreferences } from '@/lib/domain/types';
import { useNow } from '@/lib/hooks/useNow';
import { getNotificationScheduler, type PermissionState } from '@/lib/notifications/scheduler';

type Key = keyof NotificationPreferences;
type NoticeKind = 'denied' | 'unsupported';

const ITEMS = [
  { key: 'beforeEnd', title: 'notifBeforeEnd', sub: 'notifBeforeEndSub' },
  { key: 'end', title: 'notifEnd', sub: 'notifEndSub' },
  { key: 'eatingWindowEnd', title: 'notifEatingEnd', sub: 'notifEatingEndSub' },
  { key: 'water', title: 'notifWater', sub: 'notifWaterSub' },
] as const satisfies readonly { key: Key; title: string; sub: string }[];

export function NotificationsSection() {
  const t = useTranslations('settings');
  const colors = useColors();
  const { settings } = useSettings();
  const [notice, setNotice] = useState<NoticeKind | null>(null);
  const [permission, setPermission] = useState<PermissionState | null>(null);
  // zegar odświeża się też po powrocie do aplikacji (np. z ustawień systemu)
  const now = useNow(60_000);
  const anyEnabled = Object.values(settings.notifications).some(Boolean);
  const shownNotice: NoticeKind | null = notice ?? (anyEnabled && permission === 'denied' ? 'denied' : null);

  useEffect(() => {
    let cancelled = false;
    getNotificationScheduler()
      .permission()
      .then(
        (state) => !cancelled && setPermission(state),
        () => undefined,
      );
    return () => {
      cancelled = true;
    };
  }, [now]);

  const toggle = async (key: Key, value: boolean) => {
    if (value) {
      try {
        const state = await getNotificationScheduler().requestPermission();
        setPermission(state);
        if (state !== 'granted') {
          setNotice('denied');
          return;
        }
      } catch {
        setNotice('unsupported');
        return;
      }
    }
    setNotice(null);
    await updateSettings({ notifications: { ...settings.notifications, [key]: value } });
  };

  return (
    <View style={styles.section}>
      <SectionLabel>{t('notifications')}</SectionLabel>
      <ListGroup>
        {ITEMS.map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={styles.text}>
              <Text size={14} weight="bold">
                {t(item.title)}
              </Text>
              <Text size={12} color="muted">
                {t(item.sub)}
              </Text>
            </View>
            <Switch
              checked={settings.notifications[item.key]}
              onChange={(value) => void toggle(item.key, value)}
              label={t(item.title)}
              hint={t(item.sub)}
            />
          </View>
        ))}
      </ListGroup>
      {shownNotice ? (
        <Notice live="polite" icon={<IconInfo size={20} color={colors.waterText} />}>
          <Text size={13} leading={1.45}>
            {shownNotice === 'denied' ? t('notifDenied') : t('notifUnsupported')}
          </Text>
          {shownNotice === 'denied' ? (
            <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} hitSlop={8}>
              <Text size={13} weight="bold" underline>
                {t('notifOpenSettings')}
              </Text>
            </Pressable>
          ) : null}
        </Notice>
      ) : anyEnabled ? (
        <Text size={12} leading={1.45} color="muted" style={styles.limits}>
          {t('notifLimits')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 56,
    paddingVertical: 6,
    paddingLeft: 16,
    paddingRight: 12,
  },
  text: { flex: 1, minWidth: 0, gap: 1 },
  limits: { paddingHorizontal: 4 },
});
