import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/components/providers/ThemeProvider';
import { MAX_CONTENT_WIDTH, SCREEN_PADDING } from '@/lib/theme';

/**
 * Przewijana kolumna ekranu: maks. 480 px, margines 20 px, górny odstęp z safe-area.
 * `contentContainerStyle.flexGrow` pozwala dopychać przyciski do dołu elementem <Spacer />.
 */
export function Screen({
  children,
  gap = 16,
  paddingBottom = 16,
  bottomInset = false,
}: {
  children: ReactNode;
  gap?: number;
  paddingBottom?: number;
  /** ekrany bez dolnej nawigacji muszą same ominąć wskaźnik home */
  bottomInset?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        {
          gap,
          paddingTop: Math.max(16, insets.top),
          paddingBottom: paddingBottom + (bottomInset ? insets.bottom : 0),
        },
      ]}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="never"
    >
      {children}
    </ScrollView>
  );
}

/** Elastyczny odstęp (odpowiednik `flex-1` z wersji web). */
export function Spacer({ min = 0 }: { min?: number }) {
  return <View style={{ flexGrow: 1, minHeight: min }} />;
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: SCREEN_PADDING,
  },
});
