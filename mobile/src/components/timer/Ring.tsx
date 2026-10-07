import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useColors } from '@/components/providers/ThemeProvider';
import { Text } from '@/components/ui/Text';

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 124;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // 779.11
const EASE = Easing.bezier(0.2, 0.7, 0.2, 1);

type RingProps = {
  /** 0..1 */
  progress: number;
  /** 0..1 – drugie, cieńsze okrążenie po przekroczeniu celu */
  overflow?: number;
  color: 'accent' | 'water';
  label: string;
  labelTone: 'accent' | 'water';
  time: string;
  sub: string;
  /** jednorazowy puls w chwili osiągnięcia celu */
  pulse?: boolean;
};

const arc = (value: number) => CIRCUMFERENCE * (1 - Math.min(Math.max(value, 0), 1));

/** Pierścień 280×280: tor 18 px, łuk z zaokrąglonymi końcami, start na godzinie 12. */
export function Ring({ progress, overflow = 0, color, label, labelTone, time, sub, pulse }: RingProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  useEffect(() => {
    // Reanimated domyślnie pomija animację przy włączonym „ogranicz ruch”.
    if (pulse)
      scale.value = withSequence(
        withTiming(1.035, { duration: 490, easing: EASE }),
        withTiming(1, { duration: 910, easing: EASE }),
      );
  }, [pulse, scale]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.root}>
      <Animated.View style={[StyleSheet.absoluteFill, pulseStyle]}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" strokeWidth={18} stroke={colors.track} />
          {progress > 0 ? (
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              strokeWidth={18}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={arc(progress)}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              stroke={colors[color]}
            />
          ) : null}
          {overflow > 0 ? (
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={arc(overflow)}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              stroke={colors.accentText}
            />
          ) : null}
        </Svg>
      </Animated.View>
      <View style={styles.center}>
        <Text
          size={13}
          weight="bold"
          upper
          tracking={0.12}
          align="center"
          color={labelTone === 'accent' ? 'accentText' : 'waterText'}
          maxFontSizeMultiplier={1.1}
        >
          {label}
        </Text>
        <Text testID="timer-clock" display size={54} tracking={-0.03} tabular align="center" maxFontSizeMultiplier={1}>
          {time}
        </Text>
        <Text size={14} color="muted" tabular align="center" maxFontSizeMultiplier={1.1}>
          {sub}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: SIZE, height: SIZE },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 32,
  },
});
