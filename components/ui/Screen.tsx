import type { CSSProperties, ReactNode } from 'react';

/** Kolumna ekranu: max 480 px, margines 20 px, górny odstęp z safe-area. */
export function Screen({
  children,
  gap = 16,
  paddingBottom = 16,
  className = '',
  labelledBy,
}: {
  children: ReactNode;
  gap?: number;
  paddingBottom?: number;
  className?: string;
  labelledBy?: string;
}) {
  const style: CSSProperties = {
    gap,
    paddingTop: 'max(16px, env(safe-area-inset-top))',
    paddingBottom,
  };
  return (
    <main
      aria-labelledby={labelledBy}
      className={`mx-auto flex w-full max-w-[480px] flex-1 flex-col px-5 ${className}`}
      style={style}
    >
      {children}
    </main>
  );
}
