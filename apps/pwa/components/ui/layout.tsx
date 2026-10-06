import type { ComponentProps, ReactNode } from 'react';

/** Wspólne klocki układu odwzorowane z makiet. */

export function ScreenTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h1 id={id} className="m-0 font-display text-[30px] leading-none font-bold tracking-[-0.03em]">
      {children}
    </h1>
  );
}

export function SectionLabel({
  children,
  id,
  as: Tag = 'h2',
}: {
  children: ReactNode;
  id?: string;
  as?: 'h2' | 'span';
}) {
  return (
    <Tag id={id} className="m-0 text-[13px] font-bold tracking-[0.04em] text-muted uppercase">
      {children}
    </Tag>
  );
}

export function Card({ className = '', ...rest }: ComponentProps<'section'>) {
  return <section className={`rounded-[20px] border border-line bg-surface ${className}`} {...rest} />;
}

/** Zgrupowana lista wierszy (ustawienia, historia, pomiary). */
export function ListGroup({ className = '', ...rest }: ComponentProps<'div'>) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-[18px] border border-line bg-surface [&>*+*]:border-t [&>*+*]:border-line ${className}`}
      {...rest}
    />
  );
}

export function Notice({
  children,
  tone = 'water',
  icon,
  role,
}: {
  children: ReactNode;
  tone?: 'water' | 'accent' | 'neutral';
  icon?: ReactNode;
  role?: 'status' | 'alert';
}) {
  const tones = {
    water: 'bg-water-soft text-ink',
    accent: 'bg-accent-soft text-ink',
    neutral: 'bg-track text-ink',
  } as const;
  return (
    <div role={role} className={`flex gap-3 rounded-2xl px-3.5 py-3 text-[13px] leading-[1.45] ${tones[tone]}`}>
      {icon ? <span className="mt-px shrink-0">{icon}</span> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
