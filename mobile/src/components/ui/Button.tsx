import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useColors } from '@/components/providers/ThemeProvider';
import type { ColorToken } from '@/lib/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';

const VARIANTS: Record<Variant, { bg?: ColorToken; border?: ColorToken; text: ColorToken; size: number }> = {
  primary: { bg: 'btn', text: 'btnText', size: 16 },
  secondary: { bg: 'surface', border: 'line', text: 'ink', size: 15 },
  outline: { border: 'line', text: 'ink', size: 16 },
  danger: { bg: 'accentText', text: 'btnText', size: 16 },
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  variant?: Variant;
  children: ReactNode;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Przycisk 56 px, promień 18 px (sekcja 4 specyfikacji). */
export function Button({ variant = 'primary', children, icon, disabled, style, ...rest }: ButtonProps) {
  const colors = useColors();
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg ? colors[v.bg] : 'transparent',
          borderColor: v.border ? colors[v.border] : 'transparent',
          borderWidth: v.border ? StyleSheet.hairlineWidth * 2 : 0,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {icon ? <View>{icon}</View> : null}
      <Text size={v.size} weight="bold" color={v.text} align="center">
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
