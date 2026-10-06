import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { validateFastEnd, validateFastStart } from '@/lib/domain/fasting';
import { atLocalTime, HOUR } from '@/lib/domain/time';
import type { Fast } from '@/lib/domain/types';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';
import { DayTimeFields, draftFromTimestamp, StatusNote, type DayTimeDraft } from './DayTimeFields';

/**
 * Treści arkuszy Timera. Ekran pokazuje je w jednym BottomSheet (zmiana treści zamiast
 * zamykania i otwierania kolejnego okna – iOS nie lubi dwóch modali naraz).
 */

export function SheetActions({
  onCancel,
  onSave,
  saveLabel,
  disabled,
  danger,
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  const tc = useTranslations('common');
  return (
    <View style={styles.actions}>
      <Button variant="outline" onPress={onCancel} style={styles.action}>
        {tc('cancel')}
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} disabled={disabled} onPress={onSave} style={styles.action}>
        {saveLabel}
      </Button>
    </View>
  );
}

export function ErrorLine({ children }: { children: string }) {
  return (
    <Text size={14} weight="bold" color="accentText" accessibilityLiveRegion="assertive">
      {children}
    </Text>
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
  onClose: () => void;
  initialStart: number;
  openedAt: number;
  previousEndedAt?: number;
  goalHours: number;
  onSave: (startedAt: number) => Promise<void>;
};

export function StartSheetBody({
  onClose,
  initialStart,
  openedAt,
  previousEndedAt,
  goalHours,
  onSave,
}: StartSheetProps) {
  const t = useTranslations('startSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const now = useNow(1000);
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
      <SheetHeader title={t('title')} description={t('description')} />
      <DayTimeFields draft={draft} onChange={setDraft} now={now} />
      <StatusNote valid={validation.ok}>{note}</StatusNote>
      {error ? <ErrorLine>{tc('error')}</ErrorLine> : null}
      <SheetActions
        onCancel={onClose}
        onSave={() => candidate !== null && void save(candidate)}
        saveLabel={t('save')}
        disabled={!validation.ok || saving}
      />
    </>
  );
}

// ---------- Kiedy zakończyłeś post? ----------

type EndSheetProps = {
  onClose: () => void;
  fast: Fast;
  openedAt: number;
  onSave: (endedAt: number) => Promise<void>;
};

export function EndSheetBody({ onClose, fast, openedAt, onSave }: EndSheetProps) {
  const t = useTranslations('endSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const now = useNow(1000);
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
      <SheetHeader title={t('title')} description={t('description')} />
      <DayTimeFields draft={draft} onChange={setDraft} now={now} />
      <StatusNote valid={validation.ok}>{note}</StatusNote>
      {error ? <ErrorLine>{tc('error')}</ErrorLine> : null}
      <SheetActions
        onCancel={onClose}
        onSave={() => candidate !== null && void save(candidate)}
        saveLabel={t('save')}
        disabled={!validation.ok || saving}
      />
    </>
  );
}

// ---------- Zakończyć post? ----------

type EndConfirmProps = {
  onClose: () => void;
  fast: Fast;
  onEndNow: () => Promise<void>;
  onOtherTime: () => void;
};

export function EndConfirmBody({ onClose, fast, onEndNow, onOtherTime }: EndConfirmProps) {
  const t = useTranslations('endConfirm');
  const format = useFormatters();
  const now = useNow(1000);
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
        title={t('title')}
        description={
          reached
            ? t('descriptionReached', { goal: fast.goalHours })
            : t('descriptionBelow', { goal: fast.goalHours, missing: format.duration(goalMs - elapsed) })
        }
      />
      <StatusNote valid>{t('status', { duration: format.duration(elapsed) })}</StatusNote>
      <Button variant="secondary" onPress={onOtherTime}>
        {t('otherTime')}
      </Button>
      <SheetActions onCancel={onClose} onSave={() => void endNow()} saveLabel={t('endNow')} disabled={busy} />
    </>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
});
