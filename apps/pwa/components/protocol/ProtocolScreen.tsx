'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { hasInAppHistory } from '@/components/providers/NavigationTracker';
import { useSettings } from '@/components/providers/SettingsProvider';
import { BackLink } from '@/components/ui/BackLink';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { setActiveFastProtocol, updateSettings } from '@/lib/db/repo';
import { getActiveFast } from '@/lib/domain/fasting';
import { getProtocol, PROTOCOLS, type ProtocolId } from '@/lib/domain/protocols';
import { atLocalTime, HOUR, parseTimeOfDay } from '@/lib/domain/time';
import { useFasts } from '@/lib/hooks/useData';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useRovingFocus } from '@/lib/hooks/useRovingFocus';

/** Stała data odniesienia do formatowania samych godzin (bez zależności od „teraz”). */
const REFERENCE_DAY = new Date(2024, 0, 10, 12).getTime();

export function ProtocolScreen() {
  const t = useTranslations('protocol');
  const tp = useTranslations('protocols');
  const router = useRouter();
  const format = useFormatters();
  const { settings, loaded } = useSettings();
  const fasts = useFasts();
  const [picked, setPicked] = useState<ProtocolId | null>(null);
  const [mealTime, setMealTime] = useState<string | null>(null);
  const [askActive, setAskActive] = useState(false);
  const [saving, setSaving] = useState(false);
  useDocumentTitle(t('title'));

  const selectedId = picked ?? settings.protocolId;
  const selected = getProtocol(selectedId);
  const lastMeal = mealTime ?? settings.lastMealTime;
  const activeFast = fasts ? getActiveFast(fasts) : undefined;
  const onboarding = loaded && !settings.onboardingDone;

  const selectedIndex = PROTOCOLS.findIndex((p) => p.id === selectedId);
  const { getItemProps } = useRovingFocus(PROTOCOLS.length, selectedIndex, (i) => setPicked(PROTOCOLS[i].id), {
    orientation: 'vertical',
  });

  // „Post: 20:00 → 12:00 następnego dnia”
  const tod = parseTimeOfDay(lastMeal);
  let summary = '\u00a0';
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
      if (!onboarding && hasInAppHistory()) router.back();
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
    <Screen gap={16} paddingBottom={28}>
      {onboarding ? (
        <BackLink fallback="/welcome" label={t('backToWelcome')} />
      ) : (
        <BackLink fallback="/" label={t('backToTimer')} caption={t('backCaption')} />
      )}

      <div className="flex flex-col gap-1.5">
        <h1 id="protocol-title" className="m-0 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.03em]">
          {t('title')}
        </h1>
        <p className="m-0 text-sm leading-[1.45] text-muted">{t('description')}</p>
      </div>

      <div role="radiogroup" aria-labelledby="protocol-title" className="flex flex-col gap-2">
        {PROTOCOLS.map((p, index) => {
          const checked = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setPicked(p.id)}
              {...getItemProps(index)}
              className={`flex min-h-16 items-center gap-3.5 rounded-[18px] border-2 bg-surface px-4 py-2 text-left font-sans text-ink ${
                checked ? 'border-accent' : 'border-line'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 ${
                  checked ? 'border-accent' : 'border-muted'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${checked ? 'bg-accent' : 'bg-transparent'}`} />
              </span>
              <span className="w-[62px] shrink-0 font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums">
                {p.id}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
                <span className="text-sm font-bold">{tp(p.messageKey)}</span>
                <span aria-hidden="true" className="flex h-[5px] overflow-hidden rounded-[3px] bg-water-soft">
                  <span className="bg-accent" style={{ width: `${Math.round((p.fastHours / 24) * 100)}%` }} />
                </span>
                <span className="text-xs text-muted">{tp('desc', { fast: p.fastHours, eat: p.eatHours })}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[18px] border border-line bg-surface px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <label htmlFor="last-meal" className="text-sm font-bold">
            {t('lastMeal')}
          </label>
          <span id="last-meal-summary" className="text-xs text-muted">
            {summary}
          </span>
        </div>
        <input
          id="last-meal"
          type="time"
          value={lastMeal}
          aria-describedby="last-meal-summary"
          onChange={(event) => setMealTime(event.target.value)}
          className="min-h-11 shrink-0 rounded-xl border border-line bg-bg px-3 font-sans text-base font-bold text-ink tabular-nums"
        />
      </div>

      <div className="flex-1" />

      <Button onClick={onSave} aria-disabled={!loaded || saving} disabled={!loaded}>
        {t('save', { protocol: selected.id })}
      </Button>

      <BottomSheet open={askActive} onClose={() => setAskActive(false)} titleId="active-goal-title">
        <SheetHeader
          titleId="active-goal-title"
          title={t('changeActiveTitle')}
          description={t('changeActiveDescription', {
            from: activeFast?.goalHours ?? 0,
            to: selected.fastHours,
          })}
        />
        <Button onClick={() => void persist(true)}>{t('changeActiveYes', { goal: selected.fastHours })}</Button>
        <Button variant="outline" onClick={() => void persist(false)}>
          {t('changeActiveNo')}
        </Button>
      </BottomSheet>
    </Screen>
  );
}
