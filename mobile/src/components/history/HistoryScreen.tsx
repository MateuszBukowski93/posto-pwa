import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconDash } from '@/components/ui/icons';
import { BORDER, Card, ListGroup, ScreenTitle, SectionLabel } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { startFast } from '@/lib/db/repo';
import { fastDuration, getActiveFast } from '@/lib/domain/fasting';
import { getProtocol } from '@/lib/domain/protocols';
import { computePeriodStats, computeStreaks, computeWeekBars, recentFasts } from '@/lib/domain/stats';
import { HOUR } from '@/lib/domain/time';
import type { Fast } from '@/lib/domain/types';
import { useFasts } from '@/lib/hooks/useData';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { FastEditSheet } from './FastEditSheet';
import { WeekChart } from './WeekChart';

const NBSP = ' ';

export function HistoryScreen() {
  const t = useTranslations('history');
  const format = useFormatters();
  const colors = useColors();
  const { settings } = useSettings();
  const fasts = useFasts();
  const now = useNow(30_000);
  const [editing, setEditing] = useState<{ fast: Fast; openedAt: number } | null>(null);

  const ready = fasts !== undefined;
  const goalHours = getProtocol(settings.protocolId).fastHours;
  const isEmpty = ready && fasts.length === 0;

  const streaks = ready ? computeStreaks(fasts, now) : null;
  const bars = ready ? computeWeekBars(fasts, now) : null;
  const period = ready ? computePeriodStats(fasts, now) : null;
  const recent = ready ? recentFasts(fasts) : [];
  const hasActive = ready && getActiveFast(fasts) !== undefined;

  const startFirst = async () => {
    await startFast(Date.now(), settings.protocolId).catch(() => undefined);
    router.navigate('/');
  };

  const dash = '—';
  const tiles = [
    {
      label: t('average'),
      value: period?.averageMs != null ? t('hoursValue', { value: format.number(period.averageMs / HOUR, 1) }) : dash,
    },
    { label: t('longest'), value: period?.longestMs != null ? format.durationShort(period.longestMs) : dash },
    { label: t('completed'), value: period ? `${period.reached} / ${period.total}` : dash },
  ];

  return (
    <Screen gap={14}>
      <View style={styles.header}>
        <ScreenTitle>{t('title')}</ScreenTitle>
      </View>

      {isEmpty ? (
        <Card style={styles.empty}>
          <Text size={17} weight="bold" accessibilityRole="header">
            {t('emptyTitle')}
          </Text>
          <Text size={14} leading={1.45} color="muted">
            {t('emptyText')}
          </Text>
          <Button onPress={() => void startFirst()} style={styles.emptyButton}>
            {t('startFirst')}
          </Button>
        </Card>
      ) : (
        <>
          <View
            accessible
            accessibilityLabel={`${t('streakLabel')}: ${streaks?.current ?? 0} ${t('streakDays', { count: streaks?.current ?? 0 })}. ${t('longestStreak', { count: streaks?.longest ?? 0 })}`}
            style={[styles.streak, { backgroundColor: colors.accentSoft }]}
          >
            <Text display size={56} tracking={-0.04} color="accentText" tabular maxFontSizeMultiplier={1}>
              {streaks ? String(streaks.current) : NBSP}
            </Text>
            <View style={styles.streakText}>
              <Text size={17} weight="bold">
                {t('streakDays', { count: streaks?.current ?? 0 })}
              </Text>
              <Text size={13} color="muted">
                {t('longestStreak', { count: streaks?.longest ?? 0 })}
              </Text>
            </View>
          </View>

          <Card style={styles.week}>
            <View style={styles.weekTop}>
              <Text size={16} weight="bold" accessibilityRole="header">
                {t('thisWeek')}
              </Text>
              <Text size={12} color="muted">
                {t('goalShort', { goal: goalHours })}
              </Text>
            </View>
            <WeekChart bars={bars} goalHours={goalHours} />
          </Card>

          <View accessibilityLabel={t('statsLabel')} style={styles.tiles}>
            {tiles.map((tile) => (
              <View
                key={tile.label}
                style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.line }]}
              >
                <Text size={12} color="muted" numberOfLines={1}>
                  {tile.label}
                </Text>
                <Text size={17} weight="bold" tabular numberOfLines={1} adjustsFontSizeToFit>
                  {tile.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <SectionLabel>{t('recent')}</SectionLabel>
            {ready && recent.length === 0 ? (
              <Card style={styles.noCompleted}>
                <Text size={14} color="muted">
                  {hasActive ? t('noCompletedActive') : t('noCompleted')}
                </Text>
              </Card>
            ) : (
              <ListGroup>
                {recent.map((fast) => {
                  const duration = fastDuration(fast, now);
                  const ok = duration >= fast.goalHours * HOUR;
                  return (
                    <Pressable
                      key={fast.id}
                      accessibilityRole="button"
                      onPress={() => setEditing({ fast, openedAt: Date.now() })}
                      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
                    >
                      <View
                        style={[styles.status, { backgroundColor: ok ? colors.accentSoft : colors.track }]}
                        importantForAccessibility="no-hide-descendants"
                      >
                        {ok ? (
                          <IconCheck size={16} strokeWidth={2.6} color={colors.accentText} />
                        ) : (
                          <IconDash size={16} strokeWidth={2.6} color={colors.muted} />
                        )}
                      </View>
                      <View style={styles.rowMain}>
                        <Text size={14} weight="bold" numberOfLines={1}>
                          {format.mediumDate(fast.endedAt!)}
                        </Text>
                        <Text size={12} color="muted" tabular>
                          {format.time(fast.startedAt)} → {format.time(fast.endedAt!)}
                        </Text>
                      </View>
                      <View style={styles.rowEnd}>
                        <Text size={14} weight="bold" tabular>
                          {format.duration(duration)}
                        </Text>
                        <Text size={12} color="muted">
                          {ok ? t('goalReached') : t('belowGoal')}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ListGroup>
            )}
          </View>
        </>
      )}

      {fasts ? (
        <FastEditSheet
          fast={editing?.fast ?? null}
          fasts={fasts}
          openedAt={editing?.openedAt ?? 0}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 48, justifyContent: 'center' },
  empty: { gap: 12, paddingHorizontal: 18, paddingVertical: 20 },
  emptyButton: { marginTop: 4 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  streakText: { flex: 1, gap: 3 },
  week: { gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  weekTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, gap: 2, borderRadius: 16, borderWidth: BORDER, padding: 12 },
  section: { gap: 6 },
  noCompleted: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  status: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowMain: { flex: 1, minWidth: 0, gap: 1 },
  rowEnd: { alignItems: 'flex-end', gap: 1 },
});
