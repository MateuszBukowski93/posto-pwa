'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { hasInAppHistory } from '@/components/providers/NavigationTracker';
import { IconChevronLeft } from './icons';

/**
 * Strzałka wstecz. Jeśli użytkownik przyszedł z innego ekranu aplikacji – wraca w historii,
 * w przeciwnym razie (wejście z linku) prowadzi do `fallback`.
 */
export function BackLink({
  fallback,
  label,
  caption,
}: {
  fallback: string;
  /** aria-label strzałki */
  label: string;
  /** opcjonalny podpis obok strzałki (np. „Timer”) */
  caption?: ReactNode;
}) {
  const router = useRouter();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (hasInAppHistory()) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <header className="-ml-2.5 flex min-h-12 items-center gap-2">
      <Link
        href={fallback}
        aria-label={label}
        onClick={onClick}
        className="flex h-11 w-11 items-center justify-center rounded-[14px] text-ink"
      >
        <IconChevronLeft size={24} />
      </Link>
      {caption ? <span className="text-[15px] font-semibold text-muted">{caption}</span> : null}
    </header>
  );
}
