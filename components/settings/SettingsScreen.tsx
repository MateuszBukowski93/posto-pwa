'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useSettings } from '@/components/providers/SettingsProvider';
import { IconChevronRight, IconCoffee, IconGlobe } from '@/components/ui/icons';
import { ListGroup, ScreenTitle, SectionLabel } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { APP_VERSION, BUILD_SHA, isRealUrl, siteConfig } from '@/lib/config';
import { updateSettings } from '@/lib/db/repo';
import type { LocalePreference, ThemePreference } from '@/lib/domain/types';
import { sortWeightsAsc } from '@/lib/domain/weight';
import { useWeights } from '@/lib/hooks/useData';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { DataSection } from './DataSection';
import { WaterGoalSheet, WeightGoalSheet } from './GoalSheets';
import { InstallCard } from './InstallCard';
import { LANGUAGE_NAMES, LanguageSheet } from './LanguageSheet';
import { NotificationsSection } from './NotificationsSection';
import { ButtonRow, LinkRow } from './rows';

type SheetKind = 'language' | 'water' | 'weight' | null;

const footerLink =
  'inline-flex min-h-11 items-center px-2 text-[13px] font-bold text-ink underline underline-offset-[3px]';

export function SettingsScreen() {
  const t = useTranslations('settings');
  const format = useFormatters();
  const { settings } = useSettings();
  const weights = useWeights();
  const [sheet, setSheet] = useState<SheetKind>(null);
  useDocumentTitle(t('title'));

  const firstWeight = weights ? sortWeightsAsc(weights)[0]?.kg : undefined;
  const currentLanguage = settings.locale === 'system' ? t('languageSystem') : LANGUAGE_NAMES[settings.locale];
  const supportUrl = siteConfig.buyMeACoffeeUrl;

  const selectLanguage = async (locale: LocalePreference) => {
    await updateSettings({ locale });
    setSheet(null);
  };

  return (
    <Screen gap={12} paddingBottom={20}>
      <header className="flex min-h-12 items-center">
        <ScreenTitle>{t('title')}</ScreenTitle>
      </header>

      <NotificationsSection />

      <section aria-labelledby="look-title" className="flex flex-col gap-1.5">
        <SectionLabel id="look-title">{t('appearance')}</SectionLabel>
        <SegmentedControl<ThemePreference>
          label={t('theme')}
          value={settings.theme}
          onChange={(theme) => void updateSettings({ theme })}
          options={[
            { value: 'light', label: t('themeLight') },
            { value: 'dark', label: t('themeDark') },
            { value: 'system', label: t('themeSystem') },
          ]}
        />
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setSheet('language')}
          className="mt-0.5 flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-line bg-surface py-1.5 pr-3 pl-4 text-left font-sans text-ink"
        >
          <span className="flex items-center gap-2.5">
            <IconGlobe size={20} />
            <span className="text-sm font-semibold">{t('language')}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-muted">
            <span lang={settings.locale === 'system' ? undefined : settings.locale}>{currentLanguage}</span>
            <IconChevronRight size={18} />
          </span>
        </button>
      </section>

      <section aria-labelledby="goals-title" className="flex flex-col gap-1.5">
        <SectionLabel id="goals-title">{t('goals')}</SectionLabel>
        <ListGroup>
          <LinkRow href="/protocol" label={t('protocol')} value={settings.protocolId} />
          <ButtonRow
            onClick={() => setSheet('water')}
            label={t('waterGoal')}
            value={format.liters(settings.waterGoalMl)}
          />
          <ButtonRow
            onClick={() => setSheet('weight')}
            label={t('weightGoal')}
            value={settings.weightGoalKg !== undefined ? format.kg(settings.weightGoalKg) : t('notSet')}
          />
        </ListGroup>
      </section>

      <DataSection />

      <InstallCard />

      <footer className="flex flex-col items-center gap-2 pt-2 pb-2">
        {isRealUrl(supportUrl) ? (
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-bold text-ink no-underline"
          >
            <IconCoffee size={18} />
            {t('support')}
          </a>
        ) : (
          <span
            title={supportUrl}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-line px-4 text-sm font-bold text-muted"
          >
            <IconCoffee size={18} />
            {t('support')}
          </span>
        )}
        <nav aria-label={t('footerLabel')} className="flex flex-wrap items-center justify-center">
          <Link href="/terms" className={footerLink}>
            {t('terms')}
          </Link>
          <Link href="/privacy" className={footerLink}>
            {t('privacy')}
          </Link>
          <Link href="/install" className={footerLink}>
            {t('howToInstall')}
          </Link>
        </nav>
        <span className="text-xs text-muted tabular-nums">
          {t('version', { version: BUILD_SHA ? `${APP_VERSION} (${BUILD_SHA})` : APP_VERSION })}
        </span>
      </footer>

      <LanguageSheet
        open={sheet === 'language'}
        value={settings.locale}
        onClose={() => setSheet(null)}
        onSelect={(value) => void selectLanguage(value)}
      />
      <WaterGoalSheet open={sheet === 'water'} value={settings.waterGoalMl} onClose={() => setSheet(null)} />
      <WeightGoalSheet
        open={sheet === 'weight'}
        goalKg={settings.weightGoalKg}
        startKg={settings.startWeightKg}
        firstMeasurementKg={firstWeight}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}
