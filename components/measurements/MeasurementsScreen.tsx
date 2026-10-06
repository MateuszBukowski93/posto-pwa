'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useSettings } from '@/components/providers/SettingsProvider';
import { Button } from '@/components/ui/Button';
import { IconPlus } from '@/components/ui/icons';
import { ListGroup, ScreenTitle, SectionLabel } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { startOfLocalDay } from '@/lib/domain/time';
import { waterTotalForDay } from '@/lib/domain/water';
import {
  latestWeight,
  resolveStartWeight,
  sortWeightsAsc,
  sparklineGeometry,
  weightChangeOverDays,
  weightGoalProgress,
  weightTrend,
} from '@/lib/domain/weight';
import { useRecentWater, useWeights } from '@/lib/hooks/useData';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { WaterCard } from './WaterCard';
import { WeightSheet, type WeightSheetState } from './WeightSheet';

const SPARK = { width: 314, height: 64, pad: 6 };

export function MeasurementsScreen() {
  const t = useTranslations('measurements');
  const format = useFormatters();
  const { settings } = useSettings();
  const weights = useWeights();
  const now = useNow(30_000);
  const water = useRecentWater(now === null ? null : startOfLocalDay(now));
  const [sheet, setSheet] = useState<WeightSheetState>(null);
  useDocumentTitle(t('title'));

  const ready = weights !== undefined && now !== null;
  const current = weights ? latestWeight(weights) : undefined;
  const change = ready ? weightChangeOverDays(weights, now) : null;
  const trend = ready ? weightTrend(weights, now) : [];
  const geometry = trend.length >= 2 ? sparklineGeometry(trend, SPARK) : null;
  const start = weights ? resolveStartWeight(settings.startWeightKg, weights) : undefined;
  const goal = settings.weightGoalKg;
  const progress = weightGoalProgress(start, goal, current?.kg);
  const waterMl = water && now !== null ? waterTotalForDay(water, now) : null;

  const log = weights ? sortWeightsAsc(weights).reverse().slice(0, 15) : [];

  return (
    <Screen gap={14}>
      <header className="flex min-h-12 items-center justify-between">
        <ScreenTitle>{t('title')}</ScreenTitle>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setSheet({ mode: 'add', openedAt: Date.now() })}
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface pr-4 pl-3 font-sans text-sm font-bold text-ink"
        >
          <IconPlus size={18} />
          <span>{t('addWeight')}</span>
        </button>
      </header>

      <section
        aria-labelledby="weight-title"
        className="flex flex-col gap-2.5 rounded-[20px] border border-line bg-surface px-[18px] py-4"
      >
        {ready && !current ? (
          <div className="flex flex-col gap-3">
            <h2 id="weight-title" className="m-0 text-[13px] font-bold text-muted">
              {t('weight')}
            </h2>
            <p className="m-0 text-sm leading-[1.45] text-muted">{t('weightEmpty')}</p>
            <Button variant="secondary" onClick={() => setSheet({ mode: 'add', openedAt: Date.now() })}>
              {t('addFirstWeight')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <h2 id="weight-title" className="m-0 text-[13px] font-bold text-muted">
                  {t('weight')}
                </h2>
                <span className="font-display text-[40px] leading-none font-bold tracking-[-0.03em] tabular-nums">
                  {current ? (
                    <>
                      {format.number(current.kg, 1, 1)} <span className="text-xl text-muted">kg</span>
                    </>
                  ) : (
                    '\u00a0'
                  )}
                </span>
              </div>
              {change !== null ? (
                <span className="rounded-full bg-accent-soft px-2.5 py-1.5 text-[13px] font-bold text-accent-text tabular-nums">
                  {t('change30', { delta: format.delta(change) })}
                </span>
              ) : null}
            </div>
            {geometry ? (
              <div className="relative h-16 w-full">
                <svg
                  width="100%"
                  height={SPARK.height}
                  viewBox={`0 0 ${SPARK.width} ${SPARK.height}`}
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={t('trendLabel', {
                    from: format.kg(trend[0].kg, true),
                    to: format.kg(trend[trend.length - 1].kg, true),
                  })}
                  className="block overflow-visible"
                >
                  <polyline
                    points={geometry.points.map((p) => p.join(',')).join(' ')}
                    fill="none"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ stroke: 'var(--accent)' }}
                  />
                </svg>
                <span
                  aria-hidden="true"
                  className="absolute h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-accent bg-surface"
                  style={{
                    left: `${(geometry.last[0] / SPARK.width) * 100}%`,
                    top: `${(geometry.last[1] / SPARK.height) * 100}%`,
                  }}
                />
              </div>
            ) : null}
            {goal !== undefined && start !== undefined && progress !== null ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-muted tabular-nums">
                  <span>{t('startValue', { value: format.kg(start) })}</span>
                  <span>{t('goalValue', { value: format.kg(goal) })}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={t('progressLabel')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                  className="h-1.5 overflow-hidden rounded-[3px] bg-track"
                >
                  <div className="h-1.5 rounded-[3px] bg-ink" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
              </div>
            ) : ready && current ? (
              <p className="m-0 text-xs text-muted">{t('noGoal')}</p>
            ) : null}
          </>
        )}
      </section>

      <WaterCard totalMl={waterMl} goalMl={settings.waterGoalMl} />

      {log.length > 0 && now !== null ? (
        <section aria-labelledby="log-title" className="flex flex-col gap-1.5">
          <SectionLabel id="log-title">{t('recent')}</SectionLabel>
          <ListGroup>
            {log.map((entry, index) => {
              const older = log[index + 1];
              const diff = older ? format.delta(entry.kg - older.kg) : '';
              return (
                <button
                  key={entry.id}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setSheet({ mode: 'edit', entry, openedAt: Date.now() })}
                  className="flex min-h-[52px] w-full items-center justify-between gap-3 bg-transparent px-4 text-left font-sans text-ink"
                >
                  <span className="text-sm font-semibold">{format.recentDayTime(entry.at, now)}</span>
                  <span className="flex items-baseline gap-2.5">
                    <span className="text-xs text-muted tabular-nums">{diff}</span>
                    <span className="text-[15px] font-bold tabular-nums">{format.kg(entry.kg, true)}</span>
                  </span>
                </button>
              );
            })}
          </ListGroup>
        </section>
      ) : null}

      <WeightSheet state={sheet} onClose={() => setSheet(null)} />
    </Screen>
  );
}
