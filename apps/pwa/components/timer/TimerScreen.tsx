'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSettings } from '@/components/providers/SettingsProvider';
import { Button } from '@/components/ui/Button';
import { IconChevronDown, IconPencil, IconPlus } from '@/components/ui/icons';
import { Screen } from '@/components/ui/Screen';
import { addWater, endFast, readSettings, startFast, updateFastStart } from '@/lib/db/repo';
import { computeTimerState, getLastEndedFast, type TimerState } from '@/lib/domain/fasting';
import { PHASES, phaseSegments } from '@/lib/domain/phases';
import { getProtocol } from '@/lib/domain/protocols';
import { formatClock, HOUR, SECOND, startOfLocalDay } from '@/lib/domain/time';
import { waterTotalForDay } from '@/lib/domain/water';
import { latestWeight, previousWeight } from '@/lib/domain/weight';
import { relativeDay } from '@/lib/format';
import { useFasts, useRecentWater, useWeights } from '@/lib/hooks/useData';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { EndConfirmSheet, EndSheet, StartSheet } from './FastSheets';
import { Ring } from './Ring';

type SheetState =
  | { kind: 'none' }
  | { kind: 'start'; mode: 'edit'; initialStart: number; openedAt: number }
  | { kind: 'endConfirm'; openedAt: number }
  | { kind: 'end'; openedAt: number };

/** Czas „momentu osiągnięcia celu”, w którym pierścień raz pulsuje. */
const GOAL_PULSE_WINDOW = 2 * SECOND;

export function TimerScreen() {
  const t = useTranslations('timer');
  const tp = useTranslations('phases');
  const router = useRouter();
  const format = useFormatters();
  const { settings, loaded } = useSettings();
  const fasts = useFasts();
  const weights = useWeights();
  const now = useNow(1000);
  const water = useRecentWater(now === null ? null : startOfLocalDay(now));
  const [sheet, setSheet] = useState<SheetState>({ kind: 'none' });
  useDocumentTitle(t('title'));

  useEffect(() => {
    if (!loaded || settings.onboardingDone) return;
    // useLiveQuery może jeszcze nie znać zapisu z ekranu protokołu – sprawdzamy bazę przed przekierowaniem.
    let cancelled = false;
    void readSettings().then((fresh) => {
      if (!cancelled && !fresh.onboardingDone) router.replace('/welcome');
    });
    return () => {
      cancelled = true;
    };
  }, [loaded, settings.onboardingDone, router]);

  const protocol = getProtocol(settings.protocolId);
  const ready = loaded && settings.onboardingDone && fasts !== undefined && now !== null;
  const state: TimerState | null = ready
    ? computeTimerState({ fasts, now, protocol, lastMealTime: settings.lastMealTime })
    : null;
  const activeFast = state?.kind === 'fasting' ? state.fast : null;
  const previousEndedAt = fasts ? getLastEndedFast(fasts, activeFast?.id)?.endedAt : undefined;

  // ---------- akcje ----------
  const closeSheet = () => setSheet({ kind: 'none' });

  const onStartNow = async () => {
    await startFast(Date.now(), settings.protocolId).catch(() => undefined);
  };

  const openEditStart = () => {
    if (activeFast) setSheet({ kind: 'start', mode: 'edit', initialStart: activeFast.startedAt, openedAt: Date.now() });
  };

  const saveStart = async (startedAt: number) => {
    if (sheet.kind === 'start' && sheet.mode === 'edit' && activeFast) await updateFastStart(activeFast.id, startedAt);
    else await startFast(startedAt, settings.protocolId);
  };

  // ---------- widok ----------
  let ring = {
    progress: 0,
    overflow: 0,
    color: 'accent' as 'accent' | 'water',
    label: '',
    labelTone: 'accent' as 'accent' | 'water',
    time: '00:00:00',
    sub: '\u00a0',
    pulse: false,
  };
  let startLabel = '\u00a0';
  let endTitle = t('goalCard');
  let endLabel = '\u00a0';
  let phase = { name: '\u00a0', range: '', desc: '\u00a0' };
  let segments: Array<{ weight: number; tone: 'accent' | 'track' | 'water' }> = PHASES.map((p) => ({
    weight: p.weight,
    tone: 'track',
  }));
  let announcement = '';

  if (state && now !== null) {
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
  const waterMl = water && now !== null ? waterTotalForDay(water, now) : null;
  const lastWeight = weights ? latestWeight(weights) : undefined;
  const prevWeight = weights ? previousWeight(weights) : undefined;
  let weightSub = '\u00a0';
  if (weights && now !== null) {
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

  return (
    <Screen gap={16}>
      <h1 className="sr-only">{t('title')}</h1>
      <header className="flex min-h-12 items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-[26px] leading-none font-bold tracking-[-0.03em]">Posto</span>
          <span className="min-h-[1lh] text-[13px] text-muted">{now !== null ? format.longDate(now) : '\u00a0'}</span>
        </div>
        <Link
          href="/protocol"
          aria-label={t('changeProtocol', { protocol: protocol.id })}
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface pr-3.5 pl-4 text-[15px] font-bold text-ink no-underline"
        >
          <span>{protocol.id}</span>
          <IconChevronDown size={18} />
        </Link>
      </header>

      <section aria-label={t('ringLabel')} className="flex justify-center pt-1">
        <Ring {...ring} />
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </section>

      <section aria-label={t('hoursLabel')} className="grid grid-cols-2 gap-2.5">
        {activeFast ? (
          <button
            type="button"
            onClick={openEditStart}
            aria-label={t('editStart', { value: startLabel })}
            className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface py-3 pr-3 pl-4 text-left font-sans text-ink"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs text-muted">{t('start')}</span>
              <span className="text-base font-bold">{startLabel}</span>
            </span>
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent-text"
            >
              <IconPencil size={16} />
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-surface px-4 py-3">
            <span className="text-xs text-muted">{t('start')}</span>
            <span className="text-base font-bold">{startLabel}</span>
          </div>
        )}
        <div className="flex flex-col gap-0.5 rounded-2xl border border-line bg-surface px-4 py-3">
          <span className="text-xs text-muted">{endTitle}</span>
          <span className="text-base font-bold">{endLabel}</span>
        </div>
      </section>

      {activeFast ? (
        <Button onClick={() => setSheet({ kind: 'endConfirm', openedAt: Date.now() })}>
          {state?.kind === 'fasting' && state.reached ? t('endFastReached') : t('endFast')}
        </Button>
      ) : (
        <Button onClick={onStartNow} disabled={!ready}>
          {t('startNow')}
        </Button>
      )}

      <section
        aria-label={t('phaseLabel')}
        className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-surface px-4 py-3.5"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base font-bold">{phase.name}</span>
          <span className="text-xs text-muted tabular-nums">{phase.range}</span>
        </div>
        <span className="text-[13px] leading-[1.4] text-muted">{phase.desc}</span>
        <div className="flex gap-1" aria-hidden="true">
          {segments.map((s, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-[3px] ${s.tone === 'accent' ? 'bg-accent' : s.tone === 'water' ? 'bg-water' : 'bg-track'}`}
              style={{ flex: `${s.weight} 1 0` }}
            />
          ))}
        </div>
      </section>

      <section aria-label={t('todayLabel')} className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center justify-between gap-2 rounded-[18px] bg-water-soft py-3 pr-2.5 pl-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-xs font-bold text-water-text">{t('water')}</span>
            <span data-testid="water-today" className="text-lg font-bold tabular-nums">
              {waterMl !== null ? format.liters(waterMl) : '\u00a0'}
            </span>
            <span className="text-xs text-muted">{t('waterOf', { goal: format.liters(settings.waterGoalMl) })}</span>
          </div>
          <button
            type="button"
            onClick={() => void addWater(Date.now())}
            aria-label={t('addWater')}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border-none bg-water text-white"
          >
            <IconPlus size={20} strokeWidth={2.4} />
          </button>
        </div>
        <Link
          href="/measurements"
          className="flex flex-col gap-0.5 rounded-[18px] border border-line bg-surface px-4 py-3 text-ink no-underline"
        >
          <span className="text-xs font-bold text-muted">{t('weight')}</span>
          <span className="text-lg font-bold tabular-nums">{lastWeight ? format.kg(lastWeight.kg, true) : '—'}</span>
          <span className="text-xs text-muted">{weightSub}</span>
        </Link>
      </section>

      <StartSheet
        open={sheet.kind === 'start'}
        onClose={closeSheet}
        initialStart={sheet.kind === 'start' ? sheet.initialStart : 0}
        openedAt={sheet.kind === 'start' ? sheet.openedAt : 0}
        previousEndedAt={previousEndedAt}
        goalHours={activeFast?.goalHours ?? protocol.fastHours}
        onSave={saveStart}
      />
      {activeFast ? (
        <>
          <EndConfirmSheet
            open={sheet.kind === 'endConfirm'}
            onClose={closeSheet}
            fast={activeFast}
            openedAt={sheet.kind === 'endConfirm' ? sheet.openedAt : 0}
            onEndNow={() => endFast(activeFast.id, Date.now())}
            onOtherTime={() => setSheet({ kind: 'end', openedAt: Date.now() })}
          />
          <EndSheet
            open={sheet.kind === 'end'}
            onClose={closeSheet}
            fast={activeFast}
            openedAt={sheet.kind === 'end' ? sheet.openedAt : 0}
            onSave={(endedAt) => endFast(activeFast.id, endedAt)}
          />
        </>
      ) : null}
    </Screen>
  );
}
