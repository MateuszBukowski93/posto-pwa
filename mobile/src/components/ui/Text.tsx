import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useColors } from '@/components/providers/ThemeProvider';
import { FONTS, type ColorToken, type FontWeight } from '@/lib/theme';

export type TextProps = RNTextProps & {
  /** px jak w makietach */
  size?: number;
  weight?: FontWeight;
  /** Bricolage Grotesque 700 (nagłówki, cyfry) */
  display?: boolean;
  color?: ColorToken;
  /** cyfry o stałej szerokości */
  tabular?: boolean;
  /** odstęp liter w em (np. -0.03) */
  tracking?: number;
  /** wysokość linii jako mnożnik rozmiaru */
  leading?: number;
  upper?: boolean;
  align?: TextStyle['textAlign'];
  underline?: boolean;
};

/** Tekst w kroju i kolorach Posto. Skalowanie czcionki systemowej ograniczone, żeby nie rozbić układu. */
export function Text({
  size = 14,
  weight = 'regular',
  display = false,
  color = 'ink',
  tabular = false,
  tracking,
  leading,
  upper = false,
  align,
  underline = false,
  style,
  maxFontSizeMultiplier = 1.4,
  ...rest
}: TextProps) {
  const colors = useColors();
  const textStyle: TextStyle = {
    fontFamily: display ? FONTS.display : FONTS[weight],
    fontSize: size,
    color: colors[color],
  };
  if (tabular) textStyle.fontVariant = ['tabular-nums'];
  if (tracking !== undefined) textStyle.letterSpacing = tracking * size;
  if (leading !== undefined) textStyle.lineHeight = Math.round(leading * size);
  if (upper) textStyle.textTransform = 'uppercase';
  if (align) textStyle.textAlign = align;
  if (underline) textStyle.textDecorationLine = 'underline';
  return <RNText maxFontSizeMultiplier={maxFontSizeMultiplier} style={[textStyle, style]} {...rest} />;
}
