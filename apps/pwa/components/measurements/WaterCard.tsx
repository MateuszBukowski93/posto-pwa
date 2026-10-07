'use client';

import { useTranslations } from 'next-intl';
import { IconMinus } from '@/components/ui/icons';
import { addWater, removeLastWater } from '@/lib/db/repo';
import { waterGlasses } from '@/lib/domain/water';
import { useFormatters } from '@/lib/hooks/useFormatters';

/** Karta „Woda dziś”: licznik, siatka szklanek, „−” i „+ 250 ml”. */
export function WaterCard({ totalMl, goalMl }: { totalMl: number | null; goalMl: number }) {
  const t = useTranslations('measurements');
  const format = useFormatters();
  const glasses = waterGlasses(goalMl, totalMl ?? 0);

  return (
    <section aria-labelledby="water-title" className="flex flex-col gap-3 rounded-[20px] bg-water-soft px-[18px] py-4">
      <div className="flex items-baseline justify-between">
        <h2 id="water-title" className="m-0 text-[13px] font-bold text-water-text">
          {t('waterToday')}
        </h2>
        <span className="text-base font-bold tabular-nums" aria-live="polite">
          {totalMl !== null ? format.liters(totalMl) : '\u00a0'}{' '}
          <span className="font-medium text-muted">/ {format.liters(goalMl)}</span>
        </span>
      </div>
      <div
        aria-hidden="true"
        className="grid gap-[5px]"
        style={{ gridTemplateColumns: `repeat(${glasses.columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: glasses.cells }, (_, i) => (
          <div key={i} className={`h-9 rounded-lg ${i < glasses.filled ? 'bg-water' : 'bg-water-empty'}`} />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void removeLastWater(Date.now())}
          disabled={!totalMl}
          aria-label={t('removeWater')}
          className="flex min-h-12 w-12 items-center justify-center rounded-[14px] border border-water bg-transparent text-water-text disabled:opacity-40"
        >
          <IconMinus size={20} />
        </button>
        <button
          type="button"
          onClick={() => void addWater(Date.now())}
          className="min-h-12 flex-1 rounded-[14px] border-none bg-water-btn font-sans text-[15px] font-bold text-white"
        >
          {t('addWater')}
        </button>
      </div>
    </section>
  );
}
