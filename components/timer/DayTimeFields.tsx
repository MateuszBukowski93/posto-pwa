'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { IconClock } from '@/components/ui/icons';
import { addLocalDays, formatTimeOfDay, localDayDiff } from '@/lib/domain/time';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useRovingFocus } from '@/lib/hooks/useRovingFocus';

export type DayOffset = 0 | 1 | 2;
export type DayTimeDraft = { dayOffset: DayOffset; time: string };

const OFFSETS: readonly DayOffset[] = [2, 1, 0];

export function draftFromTimestamp(ts: number, reference: number): DayTimeDraft {
  const diff = Math.min(2, Math.max(0, localDayDiff(ts, reference))) as DayOffset;
  return { dayOffset: diff, time: formatTimeOfDay(ts) };
}

/** Wybór dnia (Przedwczoraj / Wczoraj / Dziś) i godziny – wspólny dla startu i końca postu. */
export function DayTimeFields({
  idPrefix,
  draft,
  onChange,
  now,
}: {
  idPrefix: string;
  draft: DayTimeDraft;
  onChange: (draft: DayTimeDraft) => void;
  now: number;
}) {
  const t = useTranslations('dayTime');
  const tc = useTranslations('common');
  const format = useFormatters();
  const labels: Record<DayOffset, string> = { 2: tc('dayBeforeYesterday'), 1: tc('yesterday'), 0: tc('today') };
  const { getItemProps } = useRovingFocus(
    OFFSETS.length,
    OFFSETS.indexOf(draft.dayOffset),
    (i) => onChange({ ...draft, dayOffset: OFFSETS[i] }),
    { orientation: 'horizontal' },
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <span id={`${idPrefix}-day`} className="text-[13px] font-bold text-muted">
          {t('day')}
        </span>
        <div role="radiogroup" aria-labelledby={`${idPrefix}-day`} className="grid grid-cols-3 gap-2">
          {OFFSETS.map((offset, index) => {
            const selected = offset === draft.dayOffset;
            return (
              <button
                key={offset}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange({ ...draft, dayOffset: offset })}
                {...getItemProps(index)}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 font-sans text-ink ${
                  selected ? 'border-accent bg-accent-soft' : 'border-line bg-transparent'
                }`}
              >
                <span className="text-sm font-bold">{labels[offset]}</span>
                <span className="text-xs text-muted tabular-nums">{format.shortDate(addLocalDays(now, -offset))}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`${idPrefix}-time`} className="text-[13px] font-bold text-muted">
          {t('time')}
        </label>
        <input
          id={`${idPrefix}-time`}
          type="time"
          required
          value={draft.time}
          onChange={(event) => onChange({ ...draft, time: event.target.value })}
          className="min-h-[52px] min-w-[140px] rounded-[14px] border-2 border-line bg-bg px-3.5 text-center font-display text-2xl font-bold text-ink tabular-nums"
        />
      </div>
    </>
  );
}

/** Podgląd na żywo pod polami (role="status"). */
export function StatusNote({ valid, children }: { valid: boolean; children: ReactNode }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 rounded-[14px] px-3.5 py-3 text-sm leading-[1.35] font-bold ${
        valid ? 'bg-accent-soft text-accent-text' : 'bg-track text-ink'
      }`}
    >
      <IconClock size={18} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
}
