import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useColors } from '@/components/providers/ThemeProvider';
import { IconChevronRight } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';

/** Wiersz z wartością i chevronem – otwiera arkusz albo ekran. */
export function ValueRow({ onPress, label, value }: { onPress: () => void; label: string; value: string }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text size={14} weight="semibold" style={styles.flex} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.value}>
        <Text size={14} color="muted" tabular numberOfLines={1}>
          {value}
        </Text>
        <IconChevronRight size={18} color={colors.muted} />
      </View>
    </Pressable>
  );
}

/** Wiersz akcji z ikoną i opisem (sekcja Dane). */
export function ActionRow({
  onPress,
  icon,
  label,
  sub,
  danger,
}: {
  onPress: () => void;
  icon: ReactNode;
  label: string;
  sub?: string;
  danger?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={sub}
      style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
    >
      <View>{icon}</View>
      <View style={styles.actionText}>
        <Text size={14} weight="bold" color={danger ? 'accentText' : 'ink'}>
          {label}
        </Text>
        {sub ? (
          <Text size={12} color="muted">
            {sub}
          </Text>
        ) : null}
      </View>
      <IconChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 48,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 12,
  },
  value: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 12,
  },
  actionText: { flex: 1, minWidth: 0, gap: 1 },
});
