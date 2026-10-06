'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconTrash } from '@/components/ui/icons';
import { addWeight, deleteWeight, updateWeight } from '@/lib/db/repo';
import { fromDateTimeLocal, toDateTimeLocal } from '@/lib/domain/time';
import type { WeightEntry } from '@/lib/domain/types';
import { KG_MAX, KG_MIN, parseKg } from '@/lib/domain/weight';
import { useFormatters } from '@/lib/hooks/useFormatters';

export type WeightSheetState =
  { mode: 'add'; openedAt: number } | { mode: 'edit'; entry: WeightEntry; openedAt: number } | null;

export function WeightSheet({ state, onClose }: { state: WeightSheetState; onClose: () => void }) {
  return (
    <BottomSheet open={state !== null} onClose={onClose} titleId="weight-sheet-title">
      {state ? <WeightSheetBody state={state} onClose={onClose} /> : null}
    </BottomSheet>
  );
}

const inputClass =
  'min-h-[52px] w-full rounded-[14px] border-2 border-line bg-bg px-3.5 font-sans text-base font-bold text-ink tabular-nums';

function WeightSheetBody({ state, onClose }: { state: NonNullable<WeightSheetState>; onClose: () => void }) {
  const t = useTranslations('weightSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const editing = state.mode === 'edit' ? state.entry : null;
  const [kgText, setKgText] = useState(() => (editing ? format.number(editing.kg, 1) : ''));
  const [when, setWhen] = useState(() => toDateTimeLocal(editing?.at ?? state.openedAt));
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const kg = parseKg(kgText);
  const at = fromDateTimeLocal(when);
  const valid = kg !== null && at !== null;
  const showError = touched && kg === null;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    setTouched(true);
    if (!valid || busy) return;
    void run(() => (editing ? updateWeight(editing.id, kg, at) : addWeight(kg, at)));
  };

  if (editing && confirmDelete) {
    return (
      <>
        <SheetHeader
          titleId="weight-sheet-title"
          title={t('deleteTitle')}
          description={t('deleteDescription', { value: format.kg(editing.kg, true) })}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            {tc('cancel')}
          </Button>
          <Button variant="danger" onClick={() => void run(() => deleteWeight(editing.id))}>
            {t('deleteConfirm')}
          </Button>
        </div>
      </>
    );
  }

  return (
    <form
      className="contents"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <SheetHeader titleId="weight-sheet-title" title={editing ? t('editTitle') : t('addTitle')} />
      <div className="flex flex-col gap-2">
        <label htmlFor="weight-kg" className="text-[13px] font-bold text-muted">
          {t('kgLabel')}
        </label>
        <div className="relative">
          <input
            id="weight-kg"
            data-autofocus
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            placeholder={format.number(75.5, 1)}
            value={kgText}
            onChange={(event) => setKgText(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showError}
            aria-describedby={showError ? 'weight-kg-error' : undefined}
            className={`${inputClass} pr-12 font-display text-2xl`}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-base font-bold text-muted"
          >
            kg
          </span>
        </div>
        {showError ? (
          <p id="weight-kg-error" role="alert" className="m-0 text-[13px] font-bold text-accent-text">
            {t('kgError', { min: KG_MIN, max: KG_MAX })}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="weight-at" className="text-[13px] font-bold text-muted">
          {t('dateLabel')}
        </label>
        <input
          id="weight-at"
          type="datetime-local"
          value={when}
          onChange={(event) => setWhen(event.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" onClick={onClose}>
          {tc('cancel')}
        </Button>
        <Button type="submit" aria-disabled={!valid || busy}>
          {tc('save')}
        </Button>
      </div>
      {editing ? (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex min-h-11 items-center justify-center gap-2 self-center rounded-xl border-none bg-transparent px-4 text-[15px] font-bold text-accent-text"
        >
          <IconTrash size={18} />
          {t('delete')}
        </button>
      ) : null}
    </form>
  );
}
