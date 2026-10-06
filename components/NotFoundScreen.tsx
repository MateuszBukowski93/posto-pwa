'use client';

import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';
import { ScreenTitle } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';

export function NotFoundScreen() {
  const t = useTranslations('notFound');
  return (
    <Screen gap={12} paddingBottom={24}>
      <div className="flex min-h-12 items-center">
        <span className="font-display text-[26px] leading-none font-bold tracking-[-0.03em]">Posto</span>
      </div>
      <ScreenTitle>{t('title')}</ScreenTitle>
      <p className="m-0 text-sm leading-[1.45] text-muted">{t('description')}</p>
      <div className="flex-1" />
      <ButtonLink href="/">{t('home')}</ButtonLink>
    </Screen>
  );
}
