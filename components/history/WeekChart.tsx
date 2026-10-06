'use client';

import { useTranslations } from 'next-intl';
import type { WeekBar } from '@/lib/domain/stats';
import { useFormatters } from '@/lib/hooks/useFormatters';

const CHART_HEIGHT = 120;
const SCALE_HOURS = 24;
const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const BAR_COLORS: Record<WeekBar['status'], string> = {
  reached: 'bg-accent',
  below: 'bg-below',
  ongoing: 'bg-accent-soft',
  empty: 'bg-transparent',
};

/** Słupki tygodnia (0–24 h) z przerywaną linią celu. */
export function WeekChart({ bars, goalHours }: { bars: WeekBar[] | null; goalHours: number }) {
  const t = useTranslations('history');
  const format = useFormatters();
  const goalBottom = Math.round((Math.min(goalHours, SCALE_HOURS) / SCALE_HOURS) * CHART_HEIGHT);
  const items = bars ?? WEEKDAY_KEYS.map(() => null);

  return (
    <>
      <div aria-hidden="true" className="relative grid grid-cols-7 items-end gap-2.5" style={{ height: CHART_HEIGHT }}>
        <div
          className="pointer-events-none absolute right-0 left-0 border-t-[1.5px] border-dashed border-muted opacity-60"
          style={{ bottom: goalBottom }}
        />
        {items.map((bar, i) => {
          const hours = bar?.hours ?? 0;
          const height =
            hours > 0 ? Math.max(4, Math.round((Math.min(hours, SCALE_HOURS) / SCALE_HOURS) * CHART_HEIGHT)) : 0;
          return (
            <div
              key={i}
              className={`rounded-t-lg rounded-b-[4px] ${bar ? BAR_COLORS[bar.status] : 'bg-transparent'}`}
              style={{ height }}
            />
          );
        })}
      </div>
      <ul className="m-0 grid list-none grid-cols-7 gap-2.5 p-0">
        {items.map((bar, i) => {
          const value = bar?.hours != null ? format.number(bar.hours, 1, 1) : '–';
          return (
            <li key={WEEKDAY_KEYS[i]} className="flex flex-col items-center gap-px">
              <span className="text-xs font-bold">{t(`weekdays.${WEEKDAY_KEYS[i]}`)}</span>
              <span className="text-[11px] text-muted tabular-nums">
                {value}
                {bar ? (
                  <span className="sr-only">
                    {' '}
                    {bar.status === 'empty'
                      ? t('noFast')
                      : bar.status === 'ongoing'
                        ? t('ongoing')
                        : bar.status === 'reached'
                          ? t('goalReached')
                          : t('belowGoal')}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
