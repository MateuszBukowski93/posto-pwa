'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute('inert') && el.getClientRects().length > 0,
  );
}

const subscribeNoop = () => () => {};

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** id elementu z tytułem arkusza */
  titleId: string;
  children: ReactNode;
  /** odstęp między sekcjami arkusza (makiety: 18 px lub 14 px) */
  gap?: 14 | 18;
};

/**
 * Arkusz wysuwany od dołu: role="dialog", aria-modal, pułapka fokusu, Esc,
 * zamknięcie kliknięciem w tło i powrót fokusu do elementu, który go otworzył.
 */
export function BottomSheet({ open, onClose, titleId, children, gap = 18 }: BottomSheetProps) {
  const t = useTranslations('common');
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Dopasowanie do widocznego obszaru, żeby klawiatura ekranowa nie zasłaniała arkusza.
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setViewport({ top: vv.offsetTop, height: vv.height });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      setViewport(null);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const appRoot = document.getElementById('app-root');
    appRoot?.setAttribute('inert', '');
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const initial = panel.querySelector<HTMLElement>('[data-autofocus]') ?? focusableIn(panel)[0] ?? panel;
    initial.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusableIn(panel);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      appRoot?.removeAttribute('inert');
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || !isClient) return null;

  return createPortal(
    <div
      className="anim-overlay fixed inset-x-0 top-0 z-50 flex flex-col"
      style={{
        background: 'var(--overlay)',
        top: viewport?.top ?? 0,
        height: viewport ? viewport.height : '100dvh',
      }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('close')}
        onClick={onClose}
        className="min-h-6 flex-1 cursor-default border-none bg-transparent"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="anim-sheet mx-auto flex max-h-[calc(100%-24px)] w-full max-w-[480px] flex-col overflow-y-auto rounded-t-[28px] bg-surface px-5 pt-[10px] text-ink outline-none"
        style={{ gap, paddingBottom: 'max(28px, calc(env(safe-area-inset-bottom) + 16px))' }}
      >
        <div aria-hidden="true" className="h-[5px] w-10 shrink-0 self-center rounded-[3px] bg-line" />
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function SheetHeader({
  titleId,
  title,
  description,
}: {
  titleId: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 id={titleId} className="m-0 font-display text-[26px] leading-[1.1] font-bold tracking-[-0.03em]">
        {title}
      </h2>
      {description ? <p className="m-0 text-sm leading-[1.45] text-muted">{description}</p> : null}
    </div>
  );
}
