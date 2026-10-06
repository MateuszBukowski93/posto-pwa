import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconChevronLeft } from './icons';
import { Text } from './Text';

/**
 * Strzałka wstecz. Gdy jest dokąd wrócić w stosie – wraca, w przeciwnym razie
 * (np. po głębokim linku) przechodzi do `fallback`.
 */
export function BackHeader({ fallback, label, caption }: { fallback: Href; label: string; caption?: string }) {
  const onPress = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={4}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
      >
        <IconChevronLeft size={24} />
      </Pressable>
      {caption ? (
        <Text size={15} weight="semibold" color="muted" importantForAccessibility="no">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, marginLeft: -10 },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
});
