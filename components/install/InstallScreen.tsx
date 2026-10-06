'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type ComponentType } from 'react';
import { hasInAppHistory } from '@/components/providers/NavigationTracker';
import { BackLink } from '@/components/ui/BackLink';
import { Button } from '@/components/ui/Button';
import {
  IconAddSquare,
  IconCheck,
  IconDots,
  IconDownload,
  IconGlobe,
  IconInfo,
  IconShare,
} from '@/components/ui/icons';
import { Notice } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { siteConfig } from '@/lib/config';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import { useInstallPrompt, useIsStandalone, usePlatform } from '@/lib/pwa/install';

type Tab = 'iphone' | 'android';
type Step = { title: string; desc: string; Icon: ComponentType<{ size?: number }> };

export function InstallScreen() {
  const t = useTranslations('install');
  const router = useRouter();
  const platform = usePlatform();
  const standalone = useIsStandalone();
  const { canPrompt, promptInstall } = useInstallPrompt();
  const [picked, setPicked] = useState<Tab | null>(null);
  useDocumentTitle(t('title'));

  // Domyślna zakładka wg user agenta (dopóki użytkownik sam nie wybierze).
  const tab: Tab = picked ?? (platform === 'android' ? 'android' : 'iphone');
  const appUrl = siteConfig.appUrl;

  const steps: Step[] =
    tab === 'iphone'
      ? [
          { title: t('iphone1Title'), desc: t('iphone1Desc', { url: appUrl }), Icon: IconGlobe },
          { title: t('iphone2Title'), desc: t('iphone2Desc'), Icon: IconShare },
          { title: t('iphone3Title'), desc: t('iphone3Desc'), Icon: IconAddSquare },
          { title: t('iphone4Title'), desc: t('iphone4Desc'), Icon: IconCheck },
        ]
      : [
          { title: t('android1Title'), desc: t('android1Desc', { url: appUrl }), Icon: IconGlobe },
          { title: t('android2Title'), desc: t('android2Desc'), Icon: IconDots },
          { title: t('android3Title'), desc: t('android3Desc'), Icon: IconDownload },
          { title: t('android4Title'), desc: t('android4Desc'), Icon: IconCheck },
        ];

  const done = () => {
    if (hasInAppHistory()) router.back();
    else router.push('/');
  };

  return (
    <Screen gap={14} paddingBottom={24}>
      <BackLink fallback="/welcome" label={t('back')} />

      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.03em]">{t('title')}</h1>
        <p className="m-0 text-sm leading-[1.45] text-muted">{t('description')}</p>
      </div>

      {standalone ? (
        <Notice tone="accent" role="status" icon={<IconCheck size={20} />}>
          {t('alreadyInstalled')}
        </Notice>
      ) : null}

      <SegmentedControl<Tab>
        kind="tab"
        label={t('tabsLabel')}
        value={tab}
        onChange={setPicked}
        options={[
          { value: 'iphone', label: 'iPhone', id: 'tab-iphone', controls: 'install-steps' },
          { value: 'android', label: 'Android', id: 'tab-android', controls: 'install-steps' },
        ]}
      />

      <ol
        id="install-steps"
        role="tabpanel"
        aria-labelledby={tab === 'iphone' ? 'tab-iphone' : 'tab-android'}
        className="m-0 flex list-none flex-col gap-2.5 p-0"
      >
        {steps.map(({ title, desc, Icon }, index) => (
          <li key={title} className="flex gap-3.5 rounded-[18px] border border-line bg-surface px-4 py-3.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-bold text-bg"
            >
              {index + 1}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="text-[15px] font-bold">{title}</span>
              <span className="text-[13px] leading-[1.4] break-words text-muted">{desc}</span>
            </span>
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text"
            >
              <Icon size={22} />
            </span>
          </li>
        ))}
      </ol>

      <Notice icon={<IconInfo size={20} />}>
        <span className="sr-only">{t('tipLabel')}: </span>
        {tab === 'iphone' ? t('iphoneTip') : t('androidTip')}
      </Notice>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5">
        {canPrompt && !standalone ? (
          <Button variant="secondary" onClick={() => void promptInstall()}>
            {t('installNow')}
          </Button>
        ) : null}
        <Button onClick={done}>{t('done')}</Button>
      </div>
    </Screen>
  );
}
