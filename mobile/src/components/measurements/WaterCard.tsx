import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { IconMinus } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { addWater, removeLastWater } from '@/lib/db/repo';
import { waterGlasses } from '@/lib/domain/water';
import { useFormatters } from '@/lib/hooks/useFormatters';

/** Karta „Woda dziś”: licznik, siatka szklanek, „−” i „+ 250 ml”. */
export function WaterCard({ totalMl, goalMl }: { totalMl: number | null; goalMl: number }) {
  const t = useTranslations('measurements');
  const format = useFormatters();
  const colors = useColors();
  const glasses = waterGlasses(goalMl, totalMl ?? 0);
  const rows = Array.from({ length: Math.ceil(glasses.cells / glasses.columns) }, (_, r) =>
    Array.from({ length: glasses.columns }, (_, c) => r * glasses.columns + c),
  );
  const canRemove = !!totalMl;

  return (
    <View style={[styles.card, { backgroundColor: colors.waterSoft }]}>
      <View style={styles.top}>
        <Text size={13} weight="bold" color="waterText" accessibilityRole="header">
          {t('waterToday')}
        </Text>
        <Text size={16} weight="bold" tabular accessibilityLiveRegion="polite">
          {totalMl !== null ? format.liters(totalMl) : ' '}{' '}
          <Text size={16} weight="medium" color="muted">
            / {format.liters(goalMl)}
          </Text>
        </Text>
      </View>
      <View style={styles.grid} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {rows.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((i) => (
              <View
                key={i}
                style={[
                  styles.glass,
                  {
                    backgroundColor:
                      i >= glasses.cells ? 'transparent' : i < glasses.filled ? colors.water : colors.waterEmpty,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.buttons}>
        <Pressable
          onPress={() => void removeLastWater(Date.now())}
          disabled={!canRemove}
          accessibilityRole="button"
          accessibilityLabel={t('removeWater')}
          accessibilityState={{ disabled: !canRemove }}
          style={({ pressed }) => [
            styles.minus,
            { borderColor: colors.water, opacity: !canRemove ? 0.4 : pressed ? 0.7 : 1 },
          ]}
        >
          <IconMinus size={20} color={colors.waterText} />
        </Pressable>
        <Pressable
          onPress={() => void addWater(Date.now())}
          accessibilityRole="button"
          style={({ pressed }) => [styles.plus, { backgroundColor: colors.waterBtn, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text size={15} weight="bold" style={styles.white}>
            {t('addWater')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 16 },
  top: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  grid: { gap: 5 },
  gridRow: { flexDirection: 'row', gap: 5 },
  glass: { flex: 1, height: 36, borderRadius: 8 },
  buttons: { flexDirection: 'row', gap: 8 },
  minus: { width: 48, minHeight: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  plus: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  white: { color: '#FFFFFF' },
});
