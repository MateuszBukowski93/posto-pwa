import { useEffect, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { MAX_CONTENT_WIDTH } from '@/lib/theme';
import { Text } from './Text';

const EASE = Easing.bezier(0.2, 0.7, 0.2, 1);

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** odstęp między sekcjami arkusza (makiety: 18 px lub 14 px) */
  gap?: 14 | 18;
};

/**
 * Arkusz wysuwany od dołu: przyciemnione tło, uchwyt, zamykanie tapnięciem w tło
 * i przyciskiem wstecz (Android). Klawiatura przesuwa arkusz w górę.
 * Treść montuje się przy każdym otwarciu – stan formularzy startuje od nowa.
 */
export function BottomSheet({ open, onClose, children, gap = 18 }: BottomSheetProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {open ? (
        <SheetPanel onClose={onClose} gap={gap}>
          {children}
        </SheetPanel>
      ) : null}
    </Modal>
  );
}

function SheetPanel({ onClose, gap, children }: Omit<BottomSheetProps, 'open'>) {
  const t = useTranslations('common');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 280, easing: EASE });
  }, [progress]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value * 1.4) }));
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - progress.value) * 600 }] }));

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.fill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, overlayStyle]}>
        <Pressable style={styles.fill} onPress={onClose} accessibilityRole="button" accessibilityLabel={t('close')} />
      </Animated.View>
      <View style={styles.spacer} pointerEvents="box-none" />
      <Animated.View accessibilityViewIsModal style={[styles.panel, { backgroundColor: colors.surface }, panelStyle]}>
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { gap, paddingBottom: Math.max(28, insets.bottom + 16) }]}
        >
          <View style={[styles.handle, { backgroundColor: colors.line }]} />
          {children}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

export function SheetHeader({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.header}>
      <Text display size={26} leading={1.1} tracking={-0.03} accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text size={14} leading={1.45} color="muted">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  spacer: { flex: 1, minHeight: 24 },
  panel: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    maxHeight: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  handle: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center' },
  header: { gap: 6 },
});
