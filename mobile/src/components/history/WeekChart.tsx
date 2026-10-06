import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { Text } from '@/components/ui/Text';
import type { WeekBar } from '@/lib/domain/stats';
import type { ColorToken } from '@/lib/theme';
import { useFormatters } from '@/lib/hooks/useFormatters';

const CHART_HEIGHT = 120;
const SCALE_HOURS = 24;
const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const BAR_COLORS: Record<WeekBar['status'], ColorToken | null> = {
  reached: 'accent',
  below: 'below',
  ongoing: 'accentSoft',
  empty: null,
};

/** Słupki tygodnia (0–24 h) z przerywaną linią celu. */
export function WeekChart({ bars, goalHours }: { bars: WeekBar[] | null; goalHours: number }) {
  const t = useTranslations('history');
  const format = useFormatters();
  const colors = useColors();
  const goalBottom = Math.round((Math.min(goalHours, SCALE_HOURS) / SCALE_HOURS) * CHART_HEIGHT);
  const items = bars ?? WEEKDAY_KEYS.map(() => null);

  const statusLabel = (bar: WeekBar) =>
    bar.status === 'empty'
      ? t('noFast')
      : bar.status === 'ongoing'
        ? t('ongoing')
        : bar.status === 'reached'
          ? t('goalReached')
          : t('belowGoal');

  return (
    <View style={styles.root}>
      <View style={styles.chart} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Svg width="100%" height={2} style={[styles.goalLine, { bottom: goalBottom - 1 }]}>
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke={colors.muted}
            strokeOpacity={0.6}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        </Svg>
        {items.map((bar, i) => {
          const hours = bar?.hours ?? 0;
          const height =
            hours > 0 ? Math.max(4, Math.round((Math.min(hours, SCALE_HOURS) / SCALE_HOURS) * CHART_HEIGHT)) : 0;
          const tone = bar ? BAR_COLORS[bar.status] : null;
          return (
            <View key={i} style={styles.column}>
              <View style={[styles.bar, { height, backgroundColor: tone ? colors[tone] : 'transparent' }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {items.map((bar, i) => {
          const value = bar?.hours != null ? format.number(bar.hours, 1, 1) : '–';
          const day = t(`weekdays.${WEEKDAY_KEYS[i]}`);
          return (
            <View
              key={WEEKDAY_KEYS[i]}
              style={styles.label}
              accessible
              accessibilityLabel={bar ? `${day} ${value} ${statusLabel(bar)}` : day}
            >
              <Text size={12} weight="bold">
                {day}
              </Text>
              <Text size={11} color="muted" tabular>
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  chart: { height: CHART_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  goalLine: { position: 'absolute', left: 0, right: 0 },
  column: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  labels: { flexDirection: 'row', gap: 10 },
  label: { flex: 1, alignItems: 'center', gap: 1 },
});
