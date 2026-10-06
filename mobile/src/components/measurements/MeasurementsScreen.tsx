import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { useTranslations } from 'use-intl';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { IconPlus } from '@/components/ui/icons';
import { BORDER, Card, ListGroup, ScreenTitle, SectionLabel } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { startOfLocalDay } from '@/lib/domain/time';
import { waterTotalForDay } from '@/lib/domain/water';
import {
  latestWeight,
  resolveStartWeight,
  sortWeightsAsc,
  sparklineGeometry,
  weightChangeOverDays,
  weightGoalProgress,
  weightTrend,
  type SparklineGeometry,
} from '@/lib/domain/weight';
import { useRecentWater, useWeights } from '@/lib/hooks/useData';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { WaterCard } from './WaterCard';
import { WeightSheet, type WeightSheetState } from './WeightSheet';

const SPARK_HEIGHT = 64;
const SPARK_PAD = 6;

export function MeasurementsScreen() {
  const t = useTranslations('measurements');
  const format = useFormatters();
  const colors = useColors();
  const { settings } = useSettings();
  const weights = useWeights();
  const now = useNow(30_000);
  const water = useRecentWater(startOfLocalDay(now));
  const [sheet, setSheet] = useState<WeightSheetState>(null);
  const [sparkWidth, setSparkWidth] = useState(0);

  const ready = weights !== undefined;
  const current = weights ? latestWeight(weights) : undefined;
  const change = ready ? weightChangeOverDays(weights, now) : null;
  const trend = ready ? weightTrend(weights, now) : [];
  const geometry: SparklineGeometry | null =
    trend.length >= 2 && sparkWidth > 0
      ? sparklineGeometry(trend, { width: sparkWidth, height: SPARK_HEIGHT, pad: SPARK_PAD })
      : null;
  const start = weights ? resolveStartWeight(settings.startWeightKg, weights) : undefined;
  const goal = settings.weightGoalKg;
  const progress = weightGoalProgress(start, goal, current?.kg);
  const waterMl = water ? waterTotalForDay(water, now) : null;

  const log = weights ? sortWeightsAsc(weights).reverse().slice(0, 15) : [];
  const openAdd = () => setSheet({ mode: 'add', openedAt: Date.now() });

  return (
    <Screen gap={14}>
      <View style={styles.header}>
        <ScreenTitle>{t('title')}</ScreenTitle>
        <Pressable
          onPress={openAdd}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.chip,
            { backgroundColor: colors.surface, borderColor: colors.line, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <IconPlus size={18} />
          <Text size={14} weight="bold">
            {t('addWeight')}
          </Text>
        </Pressable>
      </View>

      <Card style={styles.weight}>
        {ready && !current ? (
          <View style={styles.emptyWeight}>
            <Text size={13} weight="bold" color="muted" accessibilityRole="header">
              {t('weight')}
            </Text>
            <Text size={14} leading={1.45} color="muted">
              {t('weightEmpty')}
            </Text>
            <Button variant="secondary" onPress={openAdd}>
              {t('addFirstWeight')}
            </Button>
          </View>
        ) : (
          <>
            <View style={styles.weightTop}>
              <View style={styles.weightValue}>
                <Text size={13} weight="bold" color="muted" accessibilityRole="header">
                  {t('weight')}
                </Text>
                <Text display size={40} tracking={-0.03} tabular maxFontSizeMultiplier={1.2}>
                  {current ? format.number(current.kg, 1, 1) : ' '}
                  {current ? (
                    <Text display size={20} color="muted" maxFontSizeMultiplier={1.2}>
                      {' kg'}
                    </Text>
                  ) : null}
                </Text>
              </View>
              {change !== null ? (
                <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
                  <Text size={13} weight="bold" color="accentText" tabular>
                    {t('change30', { delta: format.delta(change) })}
                  </Text>
                </View>
              ) : null}
            </View>
            {trend.length >= 2 ? (
              <View
                style={styles.spark}
                onLayout={(event) => setSparkWidth(Math.round(event.nativeEvent.layout.width))}
                accessible
                accessibilityRole="image"
                accessibilityLabel={t('trendLabel', {
                  from: format.kg(trend[0].kg, true),
                  to: format.kg(trend[trend.length - 1].kg, true),
                })}
              >
                {geometry ? (
                  <Svg width={sparkWidth} height={SPARK_HEIGHT}>
                    <Polyline
                      points={geometry.points.map((p) => p.join(',')).join(' ')}
                      fill="none"
                      stroke={colors.accent}
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    <Circle
                      cx={geometry.last[0]}
                      cy={geometry.last[1]}
                      r={5.25}
                      fill={colors.surface}
                      stroke={colors.accent}
                      strokeWidth={2.5}
                    />
                  </Svg>
                ) : null}
              </View>
            ) : null}
            {goal !== undefined && start !== undefined && progress !== null ? (
              <View style={styles.progressWrap}>
                <View style={styles.progressLabels}>
                  <Text size={12} color="muted" tabular>
                    {t('startValue', { value: format.kg(start) })}
                  </Text>
                  <Text size={12} color="muted" tabular>
                    {t('goalValue', { value: format.kg(goal) })}
                  </Text>
                </View>
                <View
                  accessibilityRole="progressbar"
                  accessibilityLabel={t('progressLabel')}
                  accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
                  style={[styles.progressTrack, { backgroundColor: colors.track }]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      { backgroundColor: colors.ink, width: `${Math.round(progress * 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ) : ready && current ? (
              <Text size={12} color="muted">
                {t('noGoal')}
              </Text>
            ) : null}
          </>
        )}
      </Card>

      <WaterCard totalMl={waterMl} goalMl={settings.waterGoalMl} />

      {log.length > 0 ? (
        <View style={styles.section}>
          <SectionLabel>{t('recent')}</SectionLabel>
          <ListGroup>
            {log.map((entry, index) => {
              const older = log[index + 1];
              const diff = older ? format.delta(entry.kg - older.kg) : '';
              return (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  onPress={() => setSheet({ mode: 'edit', entry, openedAt: Date.now() })}
                  style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text size={14} weight="semibold" style={styles.rowLabel} numberOfLines={1}>
                    {format.recentDayTime(entry.at, now)}
                  </Text>
                  <View style={styles.rowValues}>
                    <Text size={12} color="muted" tabular>
                      {diff}
                    </Text>
                    <Text size={15} weight="bold" tabular>
                      {format.kg(entry.kg, true)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ListGroup>
        </View>
      ) : null}

      <WeightSheet state={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, gap: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: BORDER,
    paddingLeft: 12,
    paddingRight: 16,
  },
  weight: { gap: 10, paddingHorizontal: 18, paddingVertical: 16 },
  emptyWeight: { gap: 12 },
  weightTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  weightValue: { gap: 2, flexShrink: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  spark: { height: SPARK_HEIGHT, width: '100%' },
  progressWrap: { gap: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: 6, borderRadius: 3 },
  section: { gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  rowLabel: { flexShrink: 1 },
  rowValues: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
});
