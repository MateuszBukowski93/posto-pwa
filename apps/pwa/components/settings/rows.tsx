import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconChevronRight } from '@/components/ui/icons';

const rowClass =
  'flex min-h-12 w-full items-center justify-between gap-3 bg-transparent py-2 pr-3 pl-4 text-left font-sans text-ink no-underline';

function Value({ children }: { children: ReactNode }) {
  return (
    <span className="flex shrink-0 items-center gap-1 text-sm text-muted tabular-nums">
      {children}
      <IconChevronRight size={18} />
    </span>
  );
}

/** Wiersz z wartością i chevronem – link (np. do /protocol). */
export function LinkRow({ href, label, value }: { href: string; label: ReactNode; value: ReactNode }) {
  return (
    <Link href={href} className={rowClass}>
      <span className="text-sm font-semibold">{label}</span>
      <Value>{value}</Value>
    </Link>
  );
}

/** Wiersz z wartością i chevronem – otwiera arkusz. */
export function ButtonRow({ onClick, label, value }: { onClick: () => void; label: ReactNode; value: ReactNode }) {
  return (
    <button type="button" aria-haspopup="dialog" onClick={onClick} className={rowClass}>
      <span className="text-sm font-semibold">{label}</span>
      <Value>{value}</Value>
    </button>
  );
}

/** Wiersz akcji z ikoną i opisem (sekcja Dane). */
export function ActionRow({
  onClick,
  icon,
  label,
  sub,
  danger,
  haspopup,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  danger?: boolean;
  haspopup?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup={haspopup ? 'dialog' : undefined}
      className="flex min-h-14 w-full items-center gap-3 bg-transparent py-2 pr-3 pl-4 text-left font-sans text-ink"
    >
      <span className={`shrink-0 ${danger ? 'text-accent-text' : 'text-muted'}`}>{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className={`text-sm font-bold ${danger ? 'text-accent-text' : ''}`}>{label}</span>
        {sub ? <span className="text-xs text-muted">{sub}</span> : null}
      </span>
      <IconChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  );
}
