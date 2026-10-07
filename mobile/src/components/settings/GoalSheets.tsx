import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { SheetActions } from '@/components/timer/FastSheets';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { IconMinus, IconPlus } from '@/components/ui/icons';
import { Text } from '@/components/ui/Text';
import { updateSettings } from '@/lib/db/repo';
import { WATER_GOAL_MAX_ML, WATER_GOAL_MIN_ML } from '@/lib/domain/settings';
import { WATER_STEP_ML } from '@/lib/domain/water';
import { KG_MAX, KG_MIN, parseKg } from '@/lib/domain/weight';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { FONTS } from '@/lib/theme';

// ---------- Dzienny cel wody ----------

export function WaterGoalSheet({ open, value, onClose }: { open: boolean; value: number; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <WaterGoalBody value={value} onClose={onClose} />
    </BottomSheet>
  );
}

function WaterGoalBody({ value, onClose }: { value: number; onClose: () => void }) {
  const t = useTranslations('waterGoalSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const colors = useColors();
  const [goal, setGoal] = useState(value);
  const step = (delta: number) => setGoal((g) => Math.min(WATER_GOAL_MAX_ML, Math.max(WATER_GOAL_MIN_ML, g + delta)));
  const canDecrease = goal > WATER_GOAL_MIN_ML;
  const canIncrease = goal < WATER_GOAL_MAX_ML;

  return (
    <>
      <SheetHeader title={t('title')} description={t('description')} />
      <View style={[styles.stepper, { backgroundColor: colors.waterSoft }]}>
        <Pressable
          onPress={() => step(-WATER_STEP_ML)}
          disabled={!canDecrease}
          accessibilityRole="button"
          accessibilityLabel={t('decrease')}
          accessibilityState={{ disabled: !canDecrease }}
          style={[styles.stepButton, styles.stepOutline, { borderColor: colors.water, opacity: canDecrease ? 1 : 0.4 }]}
        >
          <IconMinus size={20} color={colors.waterText} />
        </Pressable>
        <View style={styles.stepValue} accessibilityLiveRegion="polite">
          <Text display size={32} tracking={-0.03} tabular>
            {format.liters(goal)}
          </Text>
          <Text size={12} color="muted">
            {t('glasses', { count: goal / WATER_STEP_ML })}
          </Text>
        </View>
        <Pressable
          onPress={() => step(WATER_STEP_ML)}
          disabled={!canIncrease}
          accessibilityRole="button"
          accessibilityLabel={t('increase')}
          accessibilityState={{ disabled: !canIncrease }}
          style={[styles.stepButton, { backgroundColor: colors.waterBtn, opacity: canIncrease ? 1 : 0.4 }]}
        >
          <IconPlus size={20} strokeWidth={2.4} color="#FFFFFF" />
        </Pressable>
      </View>
      <SheetActions
        onCancel={onClose}
        onSave={async () => {
          await updateSettings({ waterGoalMl: goal });
          onClose();
        }}
        saveLabel={tc('save')}
      />
    </>
  );
}

// ---------- Docelowa waga ----------

type WeightGoalProps = {
  open: boolean;
  goalKg?: number;
  startKg?: number;
  firstMeasurementKg?: number;
  onClose: () => void;
};

export function WeightGoalSheet(props: WeightGoalProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose}>
      <WeightGoalBody {...props} />
    </BottomSheet>
  );
}

function WeightGoalBody({ goalKg, startKg, firstMeasurementKg, onClose }: WeightGoalProps) {
  const t = useTranslations('weightGoalSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const colors = useColors();
  const [goalText, setGoalText] = useState(() => (goalKg !== undefined ? format.number(goalKg, 1) : ''));
  const [startText, setStartText] = useState(() => (startKg !== undefined ? format.number(startKg, 1) : ''));
  const [submitted, setSubmitted] = useState(false);

  const goal = goalText.trim() === '' ? undefined : parseKg(goalText);
  const start = startText.trim() === '' ? undefined : parseKg(startText);
  const goalInvalid = goal === null;
  const startInvalid = start === null;

  const save = async () => {
    setSubmitted(true);
    if (goal === null || start === null) return;
    await updateSettings({ weightGoalKg: goal, startWeightKg: start });
    onClose();
  };

  const inputStyle = (invalid: boolean) => [
    styles.input,
    {
      backgroundColor: colors.bg,
      borderColor: submitted && invalid ? colors.accentText : colors.line,
      color: colors.ink,
    },
  ];

  return (
    <>
      <SheetHeader title={t('title')} description={t('description')} />
      <View style={styles.field}>
        <Text size={13} weight="bold" color="muted">
          {t('goal')}
        </Text>
        <TextInput
          accessibilityLabel={t('goal')}
          keyboardType="decimal-pad"
          autoComplete="off"
          value={goalText}
          onChangeText={setGoalText}
          maxFontSizeMultiplier={1.3}
          style={inputStyle(goalInvalid)}
        />
      </View>
      <View style={styles.field}>
        <Text size={13} weight="bold" color="muted">
          {t('start')}
        </Text>
        <TextInput
          accessibilityLabel={t('start')}
          accessibilityHint={
            firstMeasurementKg !== undefined
              ? t('startHint', { value: format.kg(firstMeasurementKg) })
              : t('startHintEmpty')
          }
          keyboardType="decimal-pad"
          autoComplete="off"
          value={startText}
          placeholder={firstMeasurementKg !== undefined ? format.number(firstMeasurementKg, 1) : undefined}
          placeholderTextColor={colors.muted}
          onChangeText={setStartText}
          maxFontSizeMultiplier={1.3}
          style={inputStyle(startInvalid)}
        />
        <Text size={12} color="muted">
          {firstMeasurementKg !== undefined
            ? t('startHint', { value: format.kg(firstMeasurementKg) })
            : t('startHintEmpty')}
        </Text>
      </View>
      {submitted && (goalInvalid || startInvalid) ? (
        <Text size={13} weight="bold" color="accentText" accessibilityLiveRegion="assertive">
          {t('error', { min: KG_MIN, max: KG_MAX })}
        </Text>
      ) : null}
      <SheetActions onCancel={onClose} onSave={() => void save()} saveLabel={tc('save')} />
    </>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 18,
    padding: 12,
  },
  stepButton: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepOutline: { borderWidth: 1 },
  stepValue: { alignItems: 'center', gap: 2 },
  field: { gap: 8 },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 14,
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
});
