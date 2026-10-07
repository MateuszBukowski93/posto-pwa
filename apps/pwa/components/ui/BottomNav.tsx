'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconHistory, IconMeasurements, IconSettings, IconTimer } from './icons';

const ITEMS = [
  { href: '/', key: 'timer', Icon: IconTimer },
  { href: '/history', key: 'history', Icon: IconHistory },
  { href: '/measurements', key: 'measurements', Icon: IconMeasurements },
  { href: '/settings', key: 'settings', Icon: IconSettings },
] as const;

export function normalizePath(pathname: string | null): string {
  if (!pathname) return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function BottomNav() {
  const t = useTranslations('nav');
  const current = normalizePath(usePathname());

  return (
    <nav
      aria-label={t('label')}
      className="sticky bottom-0 z-20 w-full border-t border-line bg-surface"
      style={{ paddingBottom: 'max(12px, calc(env(safe-area-inset-bottom) + 4px))' }}
    >
      <div className="mx-auto grid w-full max-w-[480px] grid-cols-4 px-2 pt-1.5">
        {ITEMS.map(({ href, key, Icon }) => {
          const active = current === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-[3px] text-[11px] no-underline ${
                active ? 'font-bold text-accent-text' : 'font-semibold text-muted'
              }`}
            >
              <Icon size={24} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
