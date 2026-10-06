import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useColors } from '@/components/providers/ThemeProvider';
import { Text } from './Text';

/** Wspólne klocki układu odwzorowane z makiet. */

export const BORDER = StyleSheet.hairlineWidth * 2;

export function ScreenTitle({ children }: { children: ReactNode }) {
  return (
    <Text display size={30} tracking={-0.03} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text size={13} weight="bold" color="muted" upper tracking={0.04} accessibilityRole="header">
      {children}
    </Text>
  );
}

/** Karta: tło surface, ramka line, promień 20. */
export function Card({ style, ...rest }: ViewProps) {
  const colors = useColors();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }, style]} {...rest} />;
}

/** Zgrupowana lista wierszy (ustawienia, historia, pomiary) z separatorami. */
export function ListGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[styles.list, { backgroundColor: colors.surface, borderColor: colors.line }, style]}>
      {items.map((child, index) => (
        <Fragment key={child.key ?? index}>
          {index > 0 ? <View style={{ height: BORDER, backgroundColor: colors.line }} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

const NOTICE_TONES = { water: 'waterSoft', accent: 'accentSoft', neutral: 'track' } as const;

export function Notice({
  children,
  tone = 'water',
  icon,
  live,
}: {
  children: ReactNode;
  tone?: keyof typeof NOTICE_TONES;
  icon?: ReactNode;
  /** ogłoś czytnikowi ekranu (role status/alert w wersji web) */
  live?: 'polite' | 'assertive';
}) {
  const colors = useColors();
  return (
    <View accessibilityLiveRegion={live} style={[styles.notice, { backgroundColor: colors[NOTICE_TONES[tone]] }]}>
      {icon ? <View style={styles.noticeIcon}>{icon}</View> : null}
      <View style={styles.noticeBody}>
        {typeof children === 'string' ? (
          <Text size={13} leading={1.45}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: BORDER },
  list: { borderRadius: 18, borderWidth: BORDER, overflow: 'hidden' },
  notice: { flexDirection: 'row', gap: 12, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  noticeIcon: { marginTop: 1 },
  noticeBody: { flex: 1, minWidth: 0, gap: 2 },
});
