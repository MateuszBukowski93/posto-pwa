import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconChevronDown, IconPencil, IconPlus } from '@/components/ui/icons';
import { BORDER } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { addWater, endFast, startFast, updateFastStart } from '@/lib/db/repo';
import { computeTimerState, getLastEndedFast, type TimerState } from '@/lib/domain/fasting';
import { PHASES, phaseSegments } from '@/lib/domain/phases';
import { getProtocol } from '@/lib/domain/protocols';
import { formatClock, HOUR, SECOND, startOfLocalDay } from '@/lib/domain/time';
import { waterTotalForDay } from '@/lib/domain/water';
import { latestWeight, previousWeight } from '@/lib/domain/weight';
import { relativeDay } from '@/lib/format';
import { useFasts, useRecentWater, useWeights } from '@/lib/hooks/useData';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { EndConfirmBody, EndSheetBody, StartSheetBody } from './FastSheets';
import { Ring } from './Ring';

type SheetState =
  | { kind: 'none' }
  | { kind: 'start'; initialStart: number; openedAt: number }
  | { kind: 'endConfirm' }
  | { kind: 'end'; openedAt: number };

/** Czas „momentu osiągnięcia celu”, w którym pierścień raz pulsuje. */
const GOAL_PULSE_WINDOW = 2 * SECOND;
const NBSP = ' ';

export function TimerScreen() {
  const t = useTranslations('timer');
  const tp = useTranslations('phases');
  const format = useFormatters();
  const colors = useColors();
  const { settings } = useSettings();
  const fasts = useFasts();
  const weights = useWeights();
  const now = useNow(1000);
  const water = useRecentWater(startOfLocalDay(now));
  const [sheet, setSheet] = useState<SheetState>({ kind: 'none' });

  const protocol = getProtocol(settings.protocolId);
  const state: TimerState | null =
    fasts !== undefined ? computeTimerState({ fasts, now, protocol, lastMealTime: settings.lastMealTime }) : null;
  const activeFast = state?.kind === 'fasting' ? state.fast : null;
  const previousEndedAt = fasts ? getLastEndedFast(fasts, activeFast?.id)?.endedAt : undefined;

  // ---------- akcje ----------
  const closeSheet = () => setSheet({ kind: 'none' });

  const onStartNow = async () => {
    await startFast(Date.now(), settings.protocolId).catch(() => undefined);
  };

  const openEditStart = () => {
    if (activeFast) setSheet({ kind: 'start', initialStart: activeFast.startedAt, openedAt: Date.now() });
  };

  const saveStart = async (startedAt: number) => {
    if (activeFast) await updateFastStart(activeFast.id, startedAt);
    else await startFast(startedAt, settings.protocolId);
  };

  // ---------- widok ----------
  let ring = {
    progress: 0,
    overflow: 0,
    color: 'accent' as 'accent' | 'water',
    label: NBSP,
    labelTone: 'accent' as 'accent' | 'water',
    time: '00:00:00',
    sub: NBSP,
    pulse: false,
  };
  let startLabel = NBSP;
  let endTitle = t('goalCard');
  let endLabel = NBSP;
  let phase = { name: NBSP, range: '', desc: NBSP };
  let segments: { weight: number; tone: 'accent' | 'track' | 'water' }[] = PHASES.map((p) => ({
    weight: p.weight,
    tone: 'track',
  }));
  let announcement = '';

  if (state) {
    if (state.kind === 'fasting') {
      const current = PHASES[state.phaseIndex];
      ring = {
        progress: state.progress,
        overflow: state.overflow,
        color: 'accent',
        label: state.reached ? t('labelGoalReached') : t('labelFasting'),
        labelTone: 'accent',
        time: formatClock(state.elapsed),
        sub: state.reached
          ? t('overGoal', { over: format.duration(state.elapsed - state.goalMs) })
          : t('goalRemaining', { goal: state.fast.goalHours, remaining: format.duration(state.remaining) }),
        pulse: state.reached && state.elapsed - state.goalMs < GOAL_PULSE_WINDOW,
      };
      startLabel = format.dayTime(state.fast.startedAt, now);
      endTitle = t('goalCard');
      endLabel = format.dayTime(state.goalEndsAt, now);
      phase = {
        name: tp(`${current.id}.name`),
        desc: tp(`${current.id}.desc`),
        range:
          current.toHours === null
            ? tp('rangeOpen', { from: current.fromHours })
            : tp('range', { from: current.fromHours, to: current.toHours }),
      };
      segments = phaseSegments(state.elapsed).map((s) => ({ weight: s.weight, tone: s.reached ? 'accent' : 'track' }));
      announcement = state.reached
        ? t('announceGoal', { goal: state.fast.goalHours })
        : t('announcePhase', { phase: tp(`${current.id}.name`) });
    } else {
      const nextFastAt = state.nextFastAt;
      const eatHours = state.kind === 'eating' ? state.goalMs / HOUR : protocol.eatHours;
      if (state.kind === 'eating') {
        ring = {
          progress: state.progress,
          overflow: 0,
          color: 'water',
          label: t('labelEating'),
          labelTone: 'water',
          time: formatClock(state.elapsed),
          sub:
            state.remaining > 0
              ? t('goalRemaining', { goal: eatHours, remaining: format.duration(state.remaining) })
              : t('eatingOver'),
          pulse: false,
        };
        startLabel = format.dayTime(state.since, now);
      } else {
        ring = { ...ring, label: t('labelIdle'), labelTone: 'accent', sub: t('idleSub', { goal: protocol.fastHours }) };
        startLabel = t('notSet');
      }
      endTitle = t('nextFast');
      endLabel = nextFastAt !== null ? format.dayTime(nextFastAt, now) : t('notSet');
      phase = {
        name: tp('eating.name'),
        desc: tp('eating.desc', { time: nextFastAt !== null ? format.time(nextFastAt) : settings.lastMealTime }),
        range: tp('eatingRange', { hours: eatHours }),
      };
      segments = [{ weight: 1, tone: 'water' }];
    }
  }

  // ---------- szybkie karty ----------
  const waterMl = water ? waterTotalForDay(water, now) : null;
  const lastWeight = weights ? latestWeight(weights) : undefined;
  const prevWeight = weights ? previousWeight(weights) : undefined;
  let weightSub = NBSP;
  if (weights) {
    if (lastWeight && prevWeight) {
      const delta = format.delta(lastWeight.kg - prevWeight.kg);
      const rel = relativeDay(prevWeight.at, now);
      weightSub =
        rel === 'yesterday'
          ? t('weightDeltaYesterday', { delta })
          : t('weightDeltaSince', {
              delta,
              date: rel === 'today' ? format.time(prevWeight.at) : format.shortDate(prevWeight.at),
            });
    } else {
      weightSub = lastWeight ? t('weightFirst') : t('weightEmpty');
    }
  }

  const card = { backgroundColor: colors.surface, borderColor: colors.line };

  return (
    <Screen gap={16}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text display size={26} tracking={-0.03} accessibilityRole="header">
            Posto
          </Text>
          <Text size={13} color="muted">
            {format.longDate(now)}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/protocol')}
          accessibilityRole="button"
          accessibilityLabel={t('changeProtocol', { protocol: protocol.id })}
          style={({ pressed }) => [styles.chip, card, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text size={15} weight="bold">
            {protocol.id}
          </Text>
          <IconChevronDown size={18} />
        </Pressable>
      </View>

      <View accessibilityLabel={t('ringLabel')} style={styles.ringWrap}>
        <Ring {...ring} />
        {/* ogłaszamy tylko zmianę fazy lub celu, nie każdą sekundę */}
        <Text accessibilityLiveRegion="polite" style={styles.srOnly}>
          {announcement}
        </Text>
      </View>

      <View accessibilityLabel={t('hoursLabel')} style={styles.grid2}>
        {activeFast ? (
          <Pressable
            onPress={openEditStart}
            accessibilityRole="button"
            accessibilityLabel={t('editStart', { value: startLabel })}
            style={({ pressed }) => [styles.hourCard, styles.hourCardEdit, card, { opacity: pressed ? 0.7 : 1 }]}
          >
            <View style={styles.hourText}>
              <Text size={12} color="muted">
                {t('start')}
              </Text>
              <Text size={16} weight="bold">
                {startLabel}
              </Text>
            </View>
            <View style={[styles.pencil, { backgroundColor: colors.accentSoft }]}>
              <IconPencil size={16} color={colors.accentText} />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.hourCard, card]}>
            <Text size={12} color="muted">
              {t('start')}
            </Text>
            <Text size={16} weight="bold">
              {startLabel}
            </Text>
          </View>
        )}
        <View style={[styles.hourCard, card]}>
          <Text size={12} color="muted">
            {endTitle}
          </Text>
          <Text size={16} weight="bold">
            {endLabel}
          </Text>
        </View>
      </View>

      {activeFast ? (
        <Button onPress={() => setSheet({ kind: 'endConfirm' })}>
          {state?.kind === 'fasting' && state.reached ? t('endFastReached') : t('endFast')}
        </Button>
      ) : (
        <Button onPress={() => void onStartNow()} disabled={state === null}>
          {t('startNow')}
        </Button>
      )}

      <View accessibilityLabel={t('phaseLabel')} style={[styles.phase, card]}>
        <View style={styles.phaseTop}>
          <Text size={16} weight="bold" style={styles.flex}>
            {phase.name}
          </Text>
          <Text size={12} color="muted" tabular>
            {phase.range}
          </Text>
        </View>
        <Text size={13} leading={1.4} color="muted">
          {phase.desc}
        </Text>
        <View style={styles.segments} importantForAccessibility="no-hide-descendants">
          {segments.map((s, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  flexGrow: s.weight,
                  backgroundColor:
                    s.tone === 'accent' ? colors.accent : s.tone === 'water' ? colors.water : colors.track,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View accessibilityLabel={t('todayLabel')} style={styles.grid2}>
        <View style={[styles.waterCard, { backgroundColor: colors.waterSoft }]}>
          <View style={styles.hourText}>
            <Text size={12} weight="bold" color="waterText">
              {t('water')}
            </Text>
            <Text testID="water-today" size={18} weight="bold" tabular>
              {waterMl !== null ? format.liters(waterMl) : NBSP}
            </Text>
            <Text size={12} color="muted" numberOfLines={1}>
              {t('waterOf', { goal: format.liters(settings.waterGoalMl) })}
            </Text>
          </View>
          <Pressable
            onPress={() => void addWater(Date.now())}
            accessibilityRole="button"
            accessibilityLabel={t('addWater')}
            style={({ pressed }) => [styles.waterButton, { backgroundColor: colors.water, opacity: pressed ? 0.8 : 1 }]}
          >
            <IconPlus size={20} strokeWidth={2.4} color="#FFFFFF" />
          </Pressable>
        </View>
        <Pressable
          onPress={() => router.navigate('/measurements')}
          accessibilityRole="link"
          style={({ pressed }) => [styles.weightCard, card, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text size={12} weight="bold" color="muted">
            {t('weight')}
          </Text>
          <Text size={18} weight="bold" tabular>
            {lastWeight ? format.kg(lastWeight.kg, true) : '—'}
          </Text>
          <Text size={12} color="muted" numberOfLines={2}>
            {weightSub}
          </Text>
        </Pressable>
      </View>

      <BottomSheet open={sheet.kind !== 'none'} onClose={closeSheet}>
        {sheet.kind === 'start' ? (
          <StartSheetBody
            onClose={closeSheet}
            initialStart={sheet.initialStart}
            openedAt={sheet.openedAt}
            previousEndedAt={previousEndedAt}
            goalHours={activeFast?.goalHours ?? protocol.fastHours}
            onSave={saveStart}
          />
        ) : sheet.kind === 'endConfirm' && activeFast ? (
          <EndConfirmBody
            onClose={closeSheet}
            fast={activeFast}
            onEndNow={() => endFast(activeFast.id, Date.now())}
            onOtherTime={() => setSheet({ kind: 'end', openedAt: Date.now() })}
          />
        ) : sheet.kind === 'end' && activeFast ? (
          <EndSheetBody
            key="end"
            onClose={closeSheet}
            fast={activeFast}
            openedAt={sheet.openedAt}
            onSave={(endedAt) => endFast(activeFast.id, endedAt)}
          />
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  brand: { gap: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: BORDER,
    paddingLeft: 16,
    paddingRight: 14,
  },
  ringWrap: { alignItems: 'center', paddingTop: 4 },
  srOnly: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  grid2: { flexDirection: 'row', gap: 10 },
  hourCard: {
    flex: 1,
    gap: 2,
    borderRadius: 16,
    borderWidth: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hourCardEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingRight: 12,
  },
  hourText: { flex: 1, minWidth: 0, gap: 2 },
  pencil: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  phase: { gap: 10, borderRadius: 18, borderWidth: BORDER, paddingHorizontal: 16, paddingVertical: 14 },
  phaseTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  segments: { flexDirection: 'row', gap: 4 },
  segment: { height: 6, borderRadius: 3, flexBasis: 0 },
  waterCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 10,
  },
  waterButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  weightCard: { flex: 1, gap: 2, borderRadius: 18, borderWidth: BORDER, paddingHorizontal: 16, paddingVertical: 12 },
});
