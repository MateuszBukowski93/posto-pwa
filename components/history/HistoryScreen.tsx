'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useSettings } from '@/components/providers/SettingsProvider';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconDash } from '@/components/ui/icons';
import { ListGroup, ScreenTitle, SectionLabel } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { startFast } from '@/lib/db/repo';
import { fastDuration, getActiveFast } from '@/lib/domain/fasting';
import { getProtocol } from '@/lib/domain/protocols';
import { computePeriodStats, computeStreaks, computeWeekBars, recentFasts } from '@/lib/domain/stats';
import { HOUR } from '@/lib/domain/time';
import type { Fast } from '@/lib/domain/types';
import { useFasts } from '@/lib/hooks/useData';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { FastEditSheet } from './FastEditSheet';
import { WeekChart } from './WeekChart';

export function HistoryScreen() {
  const t = useTranslations('history');
  const router = useRouter();
  const format = useFormatters();
  const { settings } = useSettings();
  const fasts = useFasts();
  const now = useNow(30_000);
  const [editing, setEditing] = useState<{ fast: Fast; openedAt: number } | null>(null);
  useDocumentTitle(t('title'));

  const ready = fasts !== undefined && now !== null;
  const goalHours = getProtocol(settings.protocolId).fastHours;
  const isEmpty = ready && fasts.length === 0;

  const streaks = ready ? computeStreaks(fasts, now) : null;
  const bars = ready ? computeWeekBars(fasts, now) : null;
  const period = ready ? computePeriodStats(fasts, now) : null;
  const recent = ready ? recentFasts(fasts) : [];
  const hasActive = ready && getActiveFast(fasts) !== undefined;

  const startFirst = async () => {
    await startFast(Date.now(), settings.protocolId).catch(() => undefined);
    router.push('/');
  };

  const dash = '—';

  return (
    <Screen gap={14}>
      <header className="flex min-h-12 items-center">
        <ScreenTitle>{t('title')}</ScreenTitle>
      </header>

      {isEmpty ? (
        <section className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface px-[18px] py-5">
          <h2 className="m-0 text-[17px] font-bold">{t('emptyTitle')}</h2>
          <p className="m-0 text-sm leading-[1.45] text-muted">{t('emptyText')}</p>
          <Button onClick={startFirst} className="mt-1">
            {t('startFirst')}
          </Button>
        </section>
      ) : (
        <>
          <section
            aria-label={t('streakLabel')}
            className="flex items-center gap-4 rounded-[20px] bg-accent-soft px-[18px] py-4"
          >
            <span className="min-w-[1ch] font-display text-[56px] leading-none font-bold tracking-[-0.04em] text-accent-text tabular-nums">
              {streaks ? streaks.current : '\u00a0'}
            </span>
            <div className="flex flex-col gap-[3px]">
              <span className="text-[17px] font-bold">{t('streakDays', { count: streaks?.current ?? 0 })}</span>
              <span className="text-[13px] text-muted">{t('longestStreak', { count: streaks?.longest ?? 0 })}</span>
            </div>
          </section>

          <section
            aria-label={t('thisWeek')}
            className="flex flex-col gap-3 rounded-[20px] border border-line bg-surface px-4 pt-3.5 pb-3"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="m-0 text-base font-bold">{t('thisWeek')}</h2>
              <span className="text-xs text-muted">{t('goalShort', { goal: goalHours })}</span>
            </div>
            <WeekChart bars={bars} goalHours={goalHours} />
          </section>

          <section aria-label={t('statsLabel')} className="grid grid-cols-3 gap-2">
            {[
              {
                label: t('average'),
                value:
                  period?.averageMs != null
                    ? t('hoursValue', { value: format.number(period.averageMs / HOUR, 1) })
                    : dash,
              },
              { label: t('longest'), value: period?.longestMs != null ? format.durationShort(period.longestMs) : dash },
              { label: t('completed'), value: period ? `${period.reached} / ${period.total}` : dash },
            ].map((tile) => (
              <div key={tile.label} className="flex flex-col gap-0.5 rounded-2xl border border-line bg-surface p-3">
                <span className="text-xs text-muted">{tile.label}</span>
                <span className="text-[17px] font-bold tabular-nums">{tile.value}</span>
              </div>
            ))}
          </section>

          <section aria-labelledby="recent-title" className="flex flex-col gap-1.5">
            <SectionLabel id="recent-title">{t('recent')}</SectionLabel>
            {ready && recent.length === 0 ? (
              <p className="m-0 rounded-[18px] border border-line bg-surface px-4 py-4 text-sm text-muted">
                {hasActive ? t('noCompletedActive') : t('noCompleted')}
              </p>
            ) : (
              <ListGroup>
                {recent.map((fast) => {
                  const duration = fastDuration(fast, now ?? fast.endedAt!);
                  const ok = duration >= fast.goalHours * HOUR;
                  return (
                    <button
                      key={fast.id}
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => setEditing({ fast, openedAt: Date.now() })}
                      className="flex min-h-14 w-full items-center gap-3 border-x-0 border-b-0 bg-transparent px-4 py-2 text-left font-sans text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          ok ? 'bg-accent-soft text-accent-text' : 'bg-track text-muted'
                        }`}
                      >
                        {ok ? <IconCheck size={16} strokeWidth={2.6} /> : <IconDash size={16} strokeWidth={2.6} />}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-px">
                        <span className="text-sm font-bold">{format.mediumDate(fast.endedAt!)}</span>
                        <span className="text-xs text-muted tabular-nums">
                          {format.time(fast.startedAt)} → {format.time(fast.endedAt!)}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-px">
                        <span className="text-sm font-bold tabular-nums">{format.duration(duration)}</span>
                        <span className="text-xs text-muted">{ok ? t('goalReached') : t('belowGoal')}</span>
                      </span>
                    </button>
                  );
                })}
              </ListGroup>
            )}
          </section>
        </>
      )}

      {fasts ? (
        <FastEditSheet
          fast={editing?.fast ?? null}
          fasts={fasts}
          openedAt={editing?.openedAt ?? 0}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </Screen>
  );
}
