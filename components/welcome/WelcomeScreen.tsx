'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';
import { IconDrop, IconGift, IconLock, IconPhone, IconPhoneDownload } from '@/components/ui/icons';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';

const ARC_LENGTH = 540.35; // 2π · 86
const ARC_OFFSET = 151.3; // ≈ 72% obwodu

export function WelcomeScreen() {
  const t = useTranslations('welcome');
  useDocumentTitle(t('title'));

  const benefits = [
    { Icon: IconLock, title: t('benefitNoAccountTitle'), text: t('benefitNoAccountText') },
    { Icon: IconPhoneDownload, title: t('benefitPwaTitle'), text: t('benefitPwaText') },
    { Icon: IconGift, title: t('benefitFreeTitle'), text: t('benefitFreeText') },
  ];

  return (
    <main
      className="mx-auto flex w-full max-w-[480px] flex-1 flex-col overflow-hidden px-5 pb-6"
      style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
    >
      <header className="anim-logo flex min-h-11 items-center">
        <span className="font-display text-[26px] leading-none font-bold tracking-[-0.03em]">Posto</span>
      </header>

      <div aria-hidden="true" className="anim-hero relative mx-auto mt-1 h-[210px] w-full max-w-[350px]">
        <svg width="200" height="200" viewBox="0 0 200 200" className="absolute top-[5px] left-1/2 -translate-x-1/2">
          <circle cx="100" cy="100" r="86" fill="none" strokeWidth="16" style={{ stroke: 'var(--track)' }} />
          <circle
            className="anim-arc"
            cx="100"
            cy="100"
            r="86"
            fill="none"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={ARC_OFFSET}
            transform="rotate(-90 100 100)"
            style={{ stroke: 'var(--accent)' }}
          />
        </svg>
        <div className="absolute top-[5px] left-1/2 flex h-[200px] w-[200px] -translate-x-1/2 flex-col items-center justify-center gap-1">
          <span className="font-display text-[44px] leading-none font-bold tracking-[-0.03em]">16:8</span>
          <span className="text-xs font-bold tracking-[0.12em] text-accent-text uppercase">{t('ringLabel')}</span>
        </div>
        <div className="anim-float-up absolute top-[34px] left-0 flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-[13px] font-bold shadow-[var(--chip-shadow)]">
          <IconDrop size={16} className="text-water" />
          <span>{t('chipWater')}</span>
        </div>
        <div className="anim-float-down absolute right-0 bottom-[30px] flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-[13px] font-bold shadow-[var(--chip-shadow)]">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <span>{t('chipPhase')}</span>
        </div>
      </div>

      <div className="anim-rise-1 mt-4 flex flex-col gap-2">
        <h1 className="m-0 font-display text-[34px] leading-[1.08] font-bold tracking-[-0.035em] text-balance">
          {t('title')}
        </h1>
        <p className="m-0 text-[15px] leading-[1.45] text-muted">{t('lead')}</p>
      </div>

      <ul className="anim-rise-2 mt-[18px] mb-0 flex list-none flex-col gap-3 p-0">
        {benefits.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3.5">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-accent-soft text-accent-text"
            >
              <Icon size={22} />
            </span>
            <span className="flex flex-col gap-px">
              <span className="text-[15px] font-bold">{title}</span>
              <span className="text-[13px] text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="min-h-6 flex-1" />

      <div className="anim-rise-3 flex flex-col gap-1.5">
        <ButtonLink href="/protocol">{t('start')}</ButtonLink>
        <Link
          href="/install"
          className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] text-[15px] font-bold text-ink no-underline"
        >
          <IconPhone size={18} />
          <span className="underline underline-offset-[3px]">{t('howToInstall')}</span>
        </Link>
        <p className="mt-1 mb-0 text-center text-xs leading-normal text-muted">
          {t.rich('legal', {
            terms: (chunks) => (
              <Link href="/terms" className="font-bold text-ink">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="font-bold text-ink">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </main>
  );
}
