'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconMinus, IconPlus } from '@/components/ui/icons';
import { updateSettings } from '@/lib/db/repo';
import { WATER_GOAL_MAX_ML, WATER_GOAL_MIN_ML } from '@/lib/domain/settings';
import { WATER_STEP_ML } from '@/lib/domain/water';
import { KG_MAX, KG_MIN, parseKg } from '@/lib/domain/weight';
import { useFormatters } from '@/lib/hooks/useFormatters';

// ---------- Dzienny cel wody ----------

export function WaterGoalSheet({ open, value, onClose }: { open: boolean; value: number; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} titleId="water-goal-title">
      <WaterGoalBody value={value} onClose={onClose} />
    </BottomSheet>
  );
}

function WaterGoalBody({ value, onClose }: { value: number; onClose: () => void }) {
  const t = useTranslations('waterGoalSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const [goal, setGoal] = useState(value);
  const step = (delta: number) => setGoal((g) => Math.min(WATER_GOAL_MAX_ML, Math.max(WATER_GOAL_MIN_ML, g + delta)));

  return (
    <>
      <SheetHeader titleId="water-goal-title" title={t('title')} description={t('description')} />
      <div className="flex items-center justify-between gap-3 rounded-[18px] bg-water-soft p-3">
        <button
          type="button"
          onClick={() => step(-WATER_STEP_ML)}
          disabled={goal <= WATER_GOAL_MIN_ML}
          aria-label={t('decrease')}
          className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-water bg-transparent text-water-text disabled:opacity-40"
        >
          <IconMinus size={20} />
        </button>
        <div className="flex flex-col items-center gap-0.5" aria-live="polite">
          <span className="font-display text-[32px] leading-none font-bold tracking-[-0.03em] tabular-nums">
            {format.liters(goal)}
          </span>
          <span className="text-xs text-muted">{t('glasses', { count: goal / WATER_STEP_ML })}</span>
        </div>
        <button
          type="button"
          onClick={() => step(WATER_STEP_ML)}
          disabled={goal >= WATER_GOAL_MAX_ML}
          aria-label={t('increase')}
          className="flex h-12 w-12 items-center justify-center rounded-[14px] border-none bg-water-btn text-white disabled:opacity-40"
        >
          <IconPlus size={20} strokeWidth={2.4} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" onClick={onClose}>
          {tc('cancel')}
        </Button>
        <Button
          onClick={async () => {
            await updateSettings({ waterGoalMl: goal });
            onClose();
          }}
        >
          {tc('save')}
        </Button>
      </div>
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
    <BottomSheet open={props.open} onClose={props.onClose} titleId="weight-goal-title">
      <WeightGoalBody {...props} />
    </BottomSheet>
  );
}

const inputClass =
  'min-h-[52px] w-full rounded-[14px] border-2 border-line bg-bg px-3.5 font-sans text-base font-bold text-ink tabular-nums';

function WeightGoalBody({ goalKg, startKg, firstMeasurementKg, onClose }: WeightGoalProps) {
  const t = useTranslations('weightGoalSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const [goalText, setGoalText] = useState(() => (goalKg !== undefined ? format.number(goalKg, 1) : ''));
  const [startText, setStartText] = useState(() => (startKg !== undefined ? format.number(startKg, 1) : ''));
  const [submitted, setSubmitted] = useState(false);

  const goal = goalText.trim() === '' ? undefined : parseKg(goalText);
  const start = startText.trim() === '' ? undefined : parseKg(startText);
  const goalInvalid = goal === null;
  const startInvalid = start === null;

  const save = async () => {
    setSubmitted(true);
    if (goalInvalid || startInvalid) return;
    await updateSettings({ weightGoalKg: goal, startWeightKg: start });
    onClose();
  };

  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <SheetHeader titleId="weight-goal-title" title={t('title')} description={t('description')} />
      <div className="flex flex-col gap-2">
        <label htmlFor="goal-kg" className="text-[13px] font-bold text-muted">
          {t('goal')}
        </label>
        <input
          id="goal-kg"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={goalText}
          onChange={(event) => setGoalText(event.target.value)}
          aria-invalid={submitted && goalInvalid}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="start-kg" className="text-[13px] font-bold text-muted">
          {t('start')}
        </label>
        <input
          id="start-kg"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={startText}
          placeholder={firstMeasurementKg !== undefined ? format.number(firstMeasurementKg, 1) : undefined}
          onChange={(event) => setStartText(event.target.value)}
          aria-invalid={submitted && startInvalid}
          aria-describedby="start-kg-hint"
          className={inputClass}
        />
        <span id="start-kg-hint" className="text-xs text-muted">
          {firstMeasurementKg !== undefined
            ? t('startHint', { value: format.kg(firstMeasurementKg) })
            : t('startHintEmpty')}
        </span>
      </div>
      {submitted && (goalInvalid || startInvalid) ? (
        <p role="alert" className="m-0 text-[13px] font-bold text-accent-text">
          {t('error', { min: KG_MIN, max: KG_MAX })}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" onClick={onClose}>
          {tc('cancel')}
        </Button>
        <Button type="submit">{tc('save')}</Button>
      </div>
    </form>
  );
}
