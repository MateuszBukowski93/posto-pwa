'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { validateFastEnd, validateFastStart } from '@/lib/domain/fasting';
import { atLocalTime, HOUR } from '@/lib/domain/time';
import type { Fast } from '@/lib/domain/types';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { DayTimeFields, draftFromTimestamp, StatusNote, type DayTimeDraft } from './DayTimeFields';

function SheetActions({
  onCancel,
  onSave,
  saveLabel,
  disabled,
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  disabled: boolean;
}) {
  const tc = useTranslations('common');
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Button variant="outline" onClick={onCancel}>
        {tc('cancel')}
      </Button>
      <Button aria-disabled={disabled} onClick={disabled ? undefined : onSave}>
        {saveLabel}
      </Button>
    </div>
  );
}

function useSave(onSave: (ts: number) => Promise<void>, onClose: () => void) {
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const save = async (ts: number) => {
    setSaving(true);
    setError(false);
    try {
      await onSave(ts);
      onClose();
    } catch {
      setError(true);
      setSaving(false);
    }
  };
  return { save, saving, error };
}

// ---------- Kiedy zacząłeś post? ----------

type StartSheetProps = {
  open: boolean;
  onClose: () => void;
  initialStart: number;
  openedAt: number;
  previousEndedAt?: number;
  goalHours: number;
  onSave: (startedAt: number) => Promise<void>;
};

export function StartSheet(props: StartSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} titleId="start-sheet-title">
      <StartSheetBody {...props} />
    </BottomSheet>
  );
}

function StartSheetBody({ onClose, initialStart, openedAt, previousEndedAt, goalHours, onSave }: StartSheetProps) {
  const t = useTranslations('startSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const now = useNow(1000) ?? openedAt;
  const [draft, setDraft] = useState<DayTimeDraft>(() => draftFromTimestamp(initialStart, openedAt));
  const { save, saving, error } = useSave(onSave, onClose);

  const candidate = atLocalTime(now, draft.dayOffset, draft.time);
  const validation = validateFastStart(candidate, { now, previousEndedAt });

  let note: string;
  if (validation.ok && candidate !== null) {
    const duration = format.duration(now - candidate);
    note =
      now - candidate >= goalHours * HOUR
        ? t('previewGoal', { duration, goal: goalHours })
        : t('preview', { duration });
  } else if (!validation.ok && validation.reason === 'beforePreviousEnd') {
    note = t('beforePrevious', { when: format.dayTime(validation.previousEndedAt, now) });
  } else if (!validation.ok && validation.reason === 'future') {
    note = t('future');
  } else {
    note = t('invalid');
  }

  return (
    <>
      <SheetHeader titleId="start-sheet-title" title={t('title')} description={t('description')} />
      <DayTimeFields idPrefix="start" draft={draft} onChange={setDraft} now={now} />
      <StatusNote valid={validation.ok}>{note}</StatusNote>
      {error ? (
        <p role="alert" className="m-0 text-sm font-bold text-accent-text">
          {tc('error')}
        </p>
      ) : null}
      <SheetActions
        onCancel={onClose}
        onSave={() => candidate !== null && save(candidate)}
        saveLabel={t('save')}
        disabled={!validation.ok || saving}
      />
    </>
  );
}

// ---------- Kiedy zakończyłeś post? ----------

type EndSheetProps = {
  open: boolean;
  onClose: () => void;
  fast: Fast;
  openedAt: number;
  onSave: (endedAt: number) => Promise<void>;
};

export function EndSheet(props: EndSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} titleId="end-sheet-title">
      <EndSheetBody {...props} />
    </BottomSheet>
  );
}

function EndSheetBody({ onClose, fast, openedAt, onSave }: EndSheetProps) {
  const t = useTranslations('endSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const now = useNow(1000) ?? openedAt;
  const [draft, setDraft] = useState<DayTimeDraft>(() => draftFromTimestamp(openedAt, openedAt));
  const { save, saving, error } = useSave(onSave, onClose);

  const candidate = atLocalTime(now, draft.dayOffset, draft.time);
  const validation = validateFastEnd(candidate, { now, startedAt: fast.startedAt });

  let note: string;
  if (validation.ok && candidate !== null) {
    const ms = candidate - fast.startedAt;
    const duration = format.duration(ms);
    note =
      ms >= fast.goalHours * HOUR ? t('previewGoal', { duration, goal: fast.goalHours }) : t('preview', { duration });
  } else if (!validation.ok && validation.reason === 'beforeStart') {
    note = t('beforeStart', { when: format.dayTime(fast.startedAt, now) });
  } else if (!validation.ok && validation.reason === 'future') {
    note = t('future');
  } else {
    note = t('invalid');
  }

  return (
    <>
      <SheetHeader titleId="end-sheet-title" title={t('title')} description={t('description')} />
      <DayTimeFields idPrefix="end" draft={draft} onChange={setDraft} now={now} />
      <StatusNote valid={validation.ok}>{note}</StatusNote>
      {error ? (
        <p role="alert" className="m-0 text-sm font-bold text-accent-text">
          {tc('error')}
        </p>
      ) : null}
      <SheetActions
        onCancel={onClose}
        onSave={() => candidate !== null && save(candidate)}
        saveLabel={t('save')}
        disabled={!validation.ok || saving}
      />
    </>
  );
}

// ---------- Zakończyć post? ----------

type EndConfirmSheetProps = {
  open: boolean;
  onClose: () => void;
  fast: Fast;
  openedAt: number;
  onEndNow: () => Promise<void>;
  onOtherTime: () => void;
};

export function EndConfirmSheet(props: EndConfirmSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} titleId="end-confirm-title">
      <EndConfirmBody {...props} />
    </BottomSheet>
  );
}

function EndConfirmBody({ onClose, fast, openedAt, onEndNow, onOtherTime }: EndConfirmSheetProps) {
  const t = useTranslations('endConfirm');
  const tc = useTranslations('common');
  const format = useFormatters();
  const now = useNow(1000) ?? openedAt;
  const [busy, setBusy] = useState(false);
  const elapsed = Math.max(0, now - fast.startedAt);
  const goalMs = fast.goalHours * HOUR;
  const reached = elapsed >= goalMs;

  const endNow = async () => {
    setBusy(true);
    try {
      await onEndNow();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SheetHeader
        titleId="end-confirm-title"
        title={t('title')}
        description={
          reached
            ? t('descriptionReached', { goal: fast.goalHours })
            : t('descriptionBelow', { goal: fast.goalHours, missing: format.duration(goalMs - elapsed) })
        }
      />
      <StatusNote valid>{t('status', { duration: format.duration(elapsed) })}</StatusNote>
      <Button variant="secondary" onClick={onOtherTime}>
        {t('otherTime')}
      </Button>
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="outline" onClick={onClose}>
          {tc('cancel')}
        </Button>
        <Button aria-disabled={busy} onClick={busy ? undefined : endNow}>
          {t('endNow')}
        </Button>
      </div>
    </>
  );
}
