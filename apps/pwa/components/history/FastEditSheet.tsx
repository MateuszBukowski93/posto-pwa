'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { StatusNote } from '@/components/timer/DayTimeFields';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconTrash } from '@/components/ui/icons';
import { deleteFast, updateFastRange } from '@/lib/db/repo';
import { validateFastRange } from '@/lib/domain/fasting';
import { fromDateTimeLocal, HOUR, toDateTimeLocal } from '@/lib/domain/time';
import type { Fast } from '@/lib/domain/types';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';

type Props = { fast: Fast | null; fasts: Fast[]; openedAt: number; onClose: () => void };

/** Edycja lub usunięcie zakończonego postu z historii. */
export function FastEditSheet(props: Props) {
  return (
    <BottomSheet open={props.fast !== null} onClose={props.onClose} titleId="fast-edit-title">
      {props.fast ? <FastEditBody {...props} fast={props.fast} /> : null}
    </BottomSheet>
  );
}

const inputClass =
  'min-h-[52px] w-full rounded-[14px] border-2 border-line bg-bg px-3.5 font-sans text-base font-bold text-ink tabular-nums';

function FastEditBody({ fast, fasts, openedAt, onClose }: Props & { fast: Fast }) {
  const t = useTranslations('fastEdit');
  const tc = useTranslations('common');
  const format = useFormatters();
  const now = useNow(1000) ?? openedAt;
  const [start, setStart] = useState(() => toDateTimeLocal(fast.startedAt));
  const [end, setEnd] = useState(() => toDateTimeLocal(fast.endedAt ?? openedAt));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const startedAt = fromDateTimeLocal(start);
  const endedAt = fromDateTimeLocal(end);
  const validation = validateFastRange({ id: fast.id, startedAt, endedAt }, { now, fasts });

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(false);
    try {
      await action();
      onClose();
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  if (confirmDelete) {
    return (
      <>
        <SheetHeader titleId="fast-edit-title" title={t('deleteTitle')} description={t('deleteDescription')} />
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            {tc('cancel')}
          </Button>
          <Button
            variant="danger"
            aria-disabled={busy}
            onClick={busy ? undefined : () => run(() => deleteFast(fast.id))}
          >
            {t('deleteConfirm')}
          </Button>
        </div>
      </>
    );
  }

  let note: string;
  if (validation.ok && startedAt !== null && endedAt !== null) {
    const ms = endedAt - startedAt;
    note =
      ms >= fast.goalHours * HOUR
        ? t('previewGoal', { duration: format.duration(ms), goal: fast.goalHours })
        : t('preview', { duration: format.duration(ms) });
  } else {
    note = t(validation.ok ? 'invalid' : validation.reason);
  }

  return (
    <>
      <SheetHeader titleId="fast-edit-title" title={t('title')} />
      <div className="flex flex-col gap-2">
        <label htmlFor="fast-edit-start" className="text-[13px] font-bold text-muted">
          {t('start')}
        </label>
        <input
          id="fast-edit-start"
          type="datetime-local"
          value={start}
          max={toDateTimeLocal(now)}
          onChange={(event) => setStart(event.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="fast-edit-end" className="text-[13px] font-bold text-muted">
          {t('end')}
        </label>
        <input
          id="fast-edit-end"
          type="datetime-local"
          value={end}
          max={toDateTimeLocal(now)}
          onChange={(event) => setEnd(event.target.value)}
          className={inputClass}
        />
      </div>
      <StatusNote valid={validation.ok}>{note}</StatusNote>
      {error ? (
        <p role="alert" className="m-0 text-sm font-bold text-accent-text">
          {tc('error')}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" onClick={onClose}>
          {tc('cancel')}
        </Button>
        <Button
          aria-disabled={!validation.ok || busy}
          onClick={
            validation.ok && !busy && startedAt !== null && endedAt !== null
              ? () => run(() => updateFastRange(fast.id, startedAt, endedAt))
              : undefined
          }
        >
          {tc('save')}
        </Button>
      </div>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        className="flex min-h-11 items-center justify-center gap-2 self-center rounded-xl border-none bg-transparent px-4 text-[15px] font-bold text-accent-text"
      >
        <IconTrash size={18} />
        {t('delete')}
      </button>
    </>
  );
}
