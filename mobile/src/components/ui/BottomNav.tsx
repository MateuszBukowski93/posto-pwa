import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { MAX_CONTENT_WIDTH } from '@/lib/theme';
import { IconHistory, IconMeasurements, IconSettings, IconTimer, type IconProps } from './icons';
import { BORDER } from './layout';
import { Text } from './Text';

const ITEMS: Record<
  string,
  { key: 'timer' | 'history' | 'measurements' | 'settings'; Icon: (p: IconProps) => React.JSX.Element }
> = {
  index: { key: 'timer', Icon: IconTimer },
  history: { key: 'history', Icon: IconHistory },
  measurements: { key: 'measurements', Icon: IconMeasurements },
  settings: { key: 'settings', Icon: IconSettings },
};

/** Dolna nawigacja: 4 pozycje (ikona + podpis 11 px), aktywna w kolorze accentText. */
export function BottomNav({ state, navigation, insets }: BottomTabBarProps) {
  const t = useTranslations('nav');
  const colors = useColors();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={t('label')}
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          paddingBottom: Math.max(12, insets.bottom + 4),
        },
      ]}
    >
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const item = ITEMS[route.name];
          if (!item) return null;
          const active = state.index === index;
          const color = active ? colors.accentText : colors.muted;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={onPress}
              style={styles.item}
            >
              <item.Icon size={24} color={color} />
              <Text
                size={11}
                weight={active ? 'bold' : 'semibold'}
                color={active ? 'accentText' : 'muted'}
                numberOfLines={1}
              >
                {t(item.key)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: BORDER, width: '100%' },
  row: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  item: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
});
