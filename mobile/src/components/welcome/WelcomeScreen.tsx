import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { BORDER } from '@/components/ui/layout';
import { IconDrop, IconGift, IconLock, IconOffline } from '@/components/ui/icons';
import { Screen, Spacer } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

const EASE = Easing.bezier(0.2, 0.7, 0.2, 1);
const ARC_LENGTH = 2 * Math.PI * 86; // 540.35
const ARC_OFFSET = 151.3; // ≈ 72% obwodu

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Tekst, lista i przyciski: wjazd od dołu (translateY 14 → 0) + fade, 600 ms, kolejno co 150 ms. */
function rise(delay: number) {
  return () => {
    'worklet';
    const timing = { duration: 600, easing: EASE };
    return {
      initialValues: { opacity: 0, transform: [{ translateY: 14 }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, timing)),
        transform: [{ translateY: withDelay(delay, withTiming(0, timing)) }],
      },
    };
  };
}

/** Ilustracja: fade + scale 0.94 → 1 (700 ms, opóźnienie 100 ms). */
function heroEntering() {
  'worklet';
  const timing = { duration: 700, easing: EASE };
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.94 }] },
    animations: {
      opacity: withDelay(100, withTiming(1, timing)),
      transform: [{ scale: withDelay(100, withTiming(1, timing)) }],
    },
  };
}

function useFloat(distance: number, duration: number, delay: number) {
  const y = useSharedValue(0);
  useEffect(() => {
    const half = { duration: duration / 2, easing: Easing.inOut(Easing.ease) };
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(distance, half), withTiming(0, half)), -1));
  }, [delay, distance, duration, y]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

/**
 * Lekkie animacje wejścia jak w PWA (logo, ilustracja, łuk, tekst kolejno od dołu, unoszące się chipy).
 * Reanimated pomija je, gdy w systemie włączono ograniczenie ruchu.
 */
export function WelcomeScreen() {
  const t = useTranslations('welcome');
  const colors = useColors();
  const arc = useSharedValue(ARC_LENGTH);
  const floatUp = useFloat(-7, 4200, 1200);
  const floatDown = useFloat(6, 3800, 1500);

  useEffect(() => {
    arc.value = withDelay(350, withTiming(ARC_OFFSET, { duration: 1400, easing: EASE }));
  }, [arc]);

  const arcProps = useAnimatedProps(() => ({ strokeDashoffset: arc.value }));

  const benefits = [
    { Icon: IconLock, title: t('benefitNoAccountTitle'), text: t('benefitNoAccountText') },
    { Icon: IconOffline, title: t('benefitOfflineTitle'), text: t('benefitOfflineText') },
    { Icon: IconGift, title: t('benefitFreeTitle'), text: t('benefitFreeText') },
  ];

  const chip = { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.shadow };

  return (
    <Screen gap={0} paddingBottom={24} bottomInset>
      <Animated.View entering={FadeIn.duration(500).easing(EASE)} style={styles.logo}>
        <Text display size={26} tracking={-0.03}>
          Posto
        </Text>
      </Animated.View>

      <Animated.View
        entering={heroEntering}
        style={styles.hero}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        <View style={styles.ring}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r="86" fill="none" strokeWidth="16" stroke={colors.track} />
            <AnimatedCircle
              cx="100"
              cy="100"
              r="86"
              fill="none"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${ARC_LENGTH} ${ARC_LENGTH}`}
              animatedProps={arcProps}
              transform="rotate(-90 100 100)"
              stroke={colors.accent}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text display size={44} tracking={-0.03} maxFontSizeMultiplier={1}>
              16:8
            </Text>
            <Text size={12} weight="bold" upper tracking={0.12} color="accentText" maxFontSizeMultiplier={1}>
              {t('ringLabel')}
            </Text>
          </View>
        </View>
        <Animated.View style={[styles.chip, styles.chipWater, chip, floatUp]}>
          <IconDrop size={16} color={colors.water} />
          <Text size={13} weight="bold" maxFontSizeMultiplier={1.1}>
            {t('chipWater')}
          </Text>
        </Animated.View>
        <Animated.View style={[styles.chip, styles.chipPhase, chip, floatDown]}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <Text size={13} weight="bold" maxFontSizeMultiplier={1.1}>
            {t('chipPhase')}
          </Text>
        </Animated.View>
      </Animated.View>

      <Animated.View entering={rise(450)} style={styles.intro}>
        <Text display size={34} leading={1.08} tracking={-0.035} accessibilityRole="header">
          {t('title')}
        </Text>
        <Text size={15} leading={1.45} color="muted">
          {t('lead')}
        </Text>
      </Animated.View>

      <Animated.View entering={rise(600)} style={styles.benefits}>
        {benefits.map(({ Icon, title, text }) => (
          <View key={title} style={styles.benefit} accessible>
            <View style={[styles.benefitIcon, { backgroundColor: colors.accentSoft }]}>
              <Icon size={22} color={colors.accentText} />
            </View>
            <View style={styles.benefitText}>
              <Text size={15} weight="bold">
                {title}
              </Text>
              <Text size={13} color="muted">
                {text}
              </Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <Spacer min={24} />

      <Animated.View entering={rise(750)} style={styles.actions}>
        <Button onPress={() => router.push('/protocol')}>{t('start')}</Button>
        <Text size={12} leading={1.5} color="muted" align="center" style={styles.legal}>
          {t.rich('legal', {
            terms: (chunks) => (
              <Text size={12} weight="bold" accessibilityRole="link" onPress={() => router.push('/terms')}>
                {chunks}
              </Text>
            ),
            privacy: (chunks) => (
              <Text size={12} weight="bold" accessibilityRole="link" onPress={() => router.push('/privacy')}>
                {chunks}
              </Text>
            ),
          })}
        </Text>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { minHeight: 44, justifyContent: 'center' },
  hero: { height: 210, width: '100%', maxWidth: 350, alignSelf: 'center', marginTop: 4 },
  ring: { position: 'absolute', top: 5, left: '50%', marginLeft: -100, width: 200, height: 200 },
  ringCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOpacity: 0.08,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  chipWater: { top: 34, left: 0 },
  chipPhase: { right: 0, bottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  intro: { gap: 8, marginTop: 16 },
  benefits: { gap: 12, marginTop: 18 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  benefitIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, gap: 1 },
  actions: { gap: 6 },
  legal: { marginTop: 8 },
});
