import { useMemo } from 'react';
import { useTranslations } from 'use-intl';
import { useLocaleInfo } from '@/components/providers/I18nProvider';
import { localDayDiff } from '@/lib/domain/time';
import {
  durationParams,
  formatKg,
  formatLiters,
  formatLongDate,
  formatMediumDate,
  formatNumber,
  formatShortDate,
  formatSignedDelta,
  formatTime,
  formatWeekday,
  relativeDay,
} from '@/lib/format';

export function useFormatters() {
  const { formatLocale } = useLocaleInfo();
  const t = useTranslations('common');

  return useMemo(() => {
    const time = (ts: number) => formatTime(formatLocale, ts);
    const shortDate = (ts: number) => formatShortDate(formatLocale, ts);

    /** Dziś / Wczoraj / Jutro, starsze jako d.MM */
    const dayLabel = (ts: number, now: number) => {
      const rel = relativeDay(ts, now);
      if (rel === 'today' || rel === 'yesterday' || rel === 'tomorrow') return t(rel);
      return shortDate(ts);
    };

    return {
      locale: formatLocale,
      time,
      shortDate,
      dayLabel,
      /** „Wczoraj, 20:00” */
      dayTime: (ts: number, now: number) => t('dayTime', { day: dayLabel(ts, now), time: time(ts) }),
      /** „Dziś, 7:10” / „Sobota, 7:30” / „28.09, 7:30” */
      recentDayTime: (ts: number, now: number) => {
        const diff = localDayDiff(ts, now);
        const day =
          diff <= 1 && diff >= 0 ? dayLabel(ts, now) : diff < 7 ? formatWeekday(formatLocale, ts) : shortDate(ts);
        return t('dayTime', { day, time: time(ts) });
      },
      longDate: (ts: number) => formatLongDate(formatLocale, ts),
      mediumDate: (ts: number) => formatMediumDate(formatLocale, ts),
      number: (n: number, maxFraction = 1, minFraction = 0) => formatNumber(formatLocale, n, maxFraction, minFraction),
      kg: (kg: number, fixed = false) => formatKg(formatLocale, kg, fixed),
      liters: (ml: number) => formatLiters(formatLocale, ml),
      delta: (value: number) => formatSignedDelta(formatLocale, value),
      /** „16 h 02 min” */
      duration: (ms: number) => t('durationHM', durationParams(ms)),
      /** „20 h 15 m” */
      durationShort: (ms: number) => t('durationHMShort', durationParams(ms)),
    };
  }, [formatLocale, t]);
}

export type Formatters = ReturnType<typeof useFormatters>;
