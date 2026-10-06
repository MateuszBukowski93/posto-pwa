import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { BackHeader } from '@/components/ui/BackHeader';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { BORDER } from '@/components/ui/layout';
import { TimeField } from '@/components/ui/PickerFields';
import { Screen, Spacer } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { setActiveFastProtocol, updateSettings } from '@/lib/db/repo';
import { getActiveFast } from '@/lib/domain/fasting';
import { getProtocol, PROTOCOLS, type ProtocolId } from '@/lib/domain/protocols';
import { atLocalTime, HOUR, parseTimeOfDay } from '@/lib/domain/time';
import { useFasts } from '@/lib/hooks/useData';
import { useFormatters } from '@/lib/hooks/useFormatters';

/** Stała data odniesienia do formatowania samych godzin (bez zależności od „teraz”). */
const REFERENCE_DAY = new Date(2024, 0, 10, 12).getTime();

export function ProtocolScreen() {
  const t = useTranslations('protocol');
  const tp = useTranslations('protocols');
  const format = useFormatters();
  const colors = useColors();
  const { settings } = useSettings();
  const fasts = useFasts();
  const [picked, setPicked] = useState<ProtocolId | null>(null);
  const [mealTime, setMealTime] = useState<string | null>(null);
  const [askActive, setAskActive] = useState(false);
  const [saving, setSaving] = useState(false);
  // onboarding kończy się przejściem do Timera dopiero, gdy router zobaczy onboardingDone = true
  const [finishOnboarding, setFinishOnboarding] = useState(false);
  const [onboarding] = useState(() => !settings.onboardingDone);

  const selectedId = picked ?? settings.protocolId;
  const selected = getProtocol(selectedId);
  const lastMeal = mealTime ?? settings.lastMealTime;
  const activeFast = fasts ? getActiveFast(fasts) : undefined;

  useEffect(() => {
    if (finishOnboarding && settings.onboardingDone) router.replace('/');
  }, [finishOnboarding, settings.onboardingDone]);

  // „Post: 20:00 → 12:00 następnego dnia”
  const tod = parseTimeOfDay(lastMeal);
  let summary = ' ';
  if (tod) {
    const start = atLocalTime(REFERENCE_DAY, 0, lastMeal)!;
    const end = start + selected.fastHours * HOUR;
    const nextDay = tod.hours * 60 + tod.minutes + selected.fastHours * 60 >= 24 * 60;
    summary = t(nextDay ? 'summaryNextDay' : 'summarySameDay', { start: format.time(start), end: format.time(end) });
  }

  const persist = async (changeActive: boolean) => {
    setSaving(true);
    try {
      await updateSettings({
        protocolId: selected.id,
        lastMealTime: tod ? lastMeal : settings.lastMealTime,
        onboardingDone: true,
      });
      if (changeActive) await setActiveFastProtocol(selected.id);
      setAskActive(false);
      if (onboarding) setFinishOnboarding(true);
      else if (router.canGoBack()) router.back();
      else router.replace('/');
    } finally {
      setSaving(false);
    }
  };

  const onSave = () => {
    if (activeFast && activeFast.goalHours !== selected.fastHours) {
      setAskActive(true);
      return;
    }
    void persist(false);
  };

  return (
    <Screen gap={16} paddingBottom={28} bottomInset>
      {onboarding ? (
        <BackHeader fallback="/welcome" label={t('backToWelcome')} />
      ) : (
        <BackHeader fallback="/" label={t('backToTimer')} caption={t('backCaption')} />
      )}

      <View style={styles.intro}>
        <Text display size={30} leading={1.1} tracking={-0.03} accessibilityRole="header">
          {t('title')}
        </Text>
        <Text size={14} leading={1.45} color="muted">
          {t('description')}
        </Text>
      </View>

      <View accessibilityRole="radiogroup" accessibilityLabel={t('title')} style={styles.list}>
        {PROTOCOLS.map((p) => {
          const checked = p.id === selectedId;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="radio"
              accessibilityState={{ checked }}
              accessibilityLabel={`${p.id}, ${tp(p.messageKey)}, ${tp('desc', { fast: p.fastHours, eat: p.eatHours })}`}
              onPress={() => setPicked(p.id)}
              style={[
                styles.option,
                { backgroundColor: colors.surface, borderColor: checked ? colors.accent : colors.line },
              ]}
            >
              <View style={[styles.radio, { borderColor: checked ? colors.accent : colors.muted }]}>
                {checked ? <View style={[styles.radioDot, { backgroundColor: colors.accent }]} /> : null}
              </View>
              <Text display size={22} tracking={-0.02} tabular style={styles.optionId} maxFontSizeMultiplier={1.2}>
                {p.id}
              </Text>
              <View style={styles.optionText}>
                <Text size={14} weight="bold">
                  {tp(p.messageKey)}
                </Text>
                <View style={[styles.ratio, { backgroundColor: colors.waterSoft }]}>
                  <View style={{ width: `${Math.round((p.fastHours / 24) * 100)}%`, backgroundColor: colors.accent }} />
                </View>
                <Text size={12} color="muted">
                  {tp('desc', { fast: p.fastHours, eat: p.eatHours })}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.meal, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <TimeField
          label={t('lastMeal')}
          value={lastMeal}
          onChange={setMealTime}
          left={
            <View style={styles.mealText}>
              <Text size={14} weight="bold">
                {t('lastMeal')}
              </Text>
              <Text size={12} color="muted">
                {summary}
              </Text>
            </View>
          }
        />
      </View>

      <Spacer />

      <Button onPress={onSave} disabled={saving}>
        {t('save', { protocol: selected.id })}
      </Button>

      <BottomSheet open={askActive} onClose={() => setAskActive(false)}>
        <SheetHeader
          title={t('changeActiveTitle')}
          description={t('changeActiveDescription', { from: activeFast?.goalHours ?? 0, to: selected.fastHours })}
        />
        <Button onPress={() => void persist(true)} disabled={saving}>
          {t('changeActiveYes', { goal: selected.fastHours })}
        </Button>
        <Button variant="outline" onPress={() => void persist(false)} disabled={saving}>
          {t('changeActiveNo')}
        </Button>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
  list: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optionId: { width: 62 },
  optionText: { flex: 1, minWidth: 0, gap: 5 },
  ratio: { height: 5, borderRadius: 3, overflow: 'hidden', flexDirection: 'row' },
  meal: { borderRadius: 18, borderWidth: BORDER, paddingHorizontal: 16, paddingVertical: 12 },
  mealText: { gap: 2 },
});
