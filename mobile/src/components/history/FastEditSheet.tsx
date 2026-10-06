import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { ErrorLine, SheetActions } from '@/components/timer/FastSheets';
import { StatusNote } from '@/components/timer/DayTimeFields';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { IconTrash } from '@/components/ui/icons';
import { DateTimeField } from '@/components/ui/PickerFields';
import { Text } from '@/components/ui/Text';
import { deleteFast, updateFastRange } from '@/lib/db/repo';
import { validateFastRange } from '@/lib/domain/fasting';
import { HOUR } from '@/lib/domain/time';
import type { Fast } from '@/lib/domain/types';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { useNow } from '@/lib/hooks/useNow';

type Props = { fast: Fast | null; fasts: Fast[]; openedAt: number; onClose: () => void };

/** Edycja lub usunięcie zakończonego postu z historii. */
export function FastEditSheet(props: Props) {
  return (
    <BottomSheet open={props.fast !== null} onClose={props.onClose}>
      {props.fast ? <FastEditBody {...props} fast={props.fast} /> : null}
    </BottomSheet>
  );
}

/** Ostatnia minuta – pickery nie mają sekund, a walidacja porównuje z „teraz”. */
const floorMinute = (ts: number) => Math.floor(ts / 60_000) * 60_000;

function FastEditBody({ fast, fasts, openedAt, onClose }: Props & { fast: Fast }) {
  const t = useTranslations('fastEdit');
  const tc = useTranslations('common');
  const format = useFormatters();
  const colors = useColors();
  const now = useNow(1000);
  const [startedAt, setStartedAt] = useState(() => floorMinute(fast.startedAt));
  const [endedAt, setEndedAt] = useState(() => floorMinute(fast.endedAt ?? openedAt));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

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
        <SheetHeader title={t('deleteTitle')} description={t('deleteDescription')} />
        {error ? <ErrorLine>{tc('error')}</ErrorLine> : null}
        <SheetActions
          onCancel={() => setConfirmDelete(false)}
          onSave={() => void run(() => deleteFast(fast.id))}
          saveLabel={t('deleteConfirm')}
          disabled={busy}
          danger
        />
      </>
    );
  }

  let note: string;
  if (validation.ok) {
    const ms = endedAt - startedAt;
    note =
      ms >= fast.goalHours * HOUR
        ? t('previewGoal', { duration: format.duration(ms), goal: fast.goalHours })
        : t('preview', { duration: format.duration(ms) });
  } else {
    note = t(validation.reason);
  }

  return (
    <>
      <SheetHeader title={t('title')} />
      <View style={styles.field}>
        <Text size={13} weight="bold" color="muted">
          {t('start')}
        </Text>
        <DateTimeField label={t('start')} value={startedAt} onChange={setStartedAt} maximumDate={now} />
      </View>
      <View style={styles.field}>
        <Text size={13} weight="bold" color="muted">
          {t('end')}
        </Text>
        <DateTimeField label={t('end')} value={endedAt} onChange={setEndedAt} maximumDate={now} />
      </View>
      <StatusNote valid={validation.ok}>{note}</StatusNote>
      {error ? <ErrorLine>{tc('error')}</ErrorLine> : null}
      <SheetActions
        onCancel={onClose}
        onSave={() => void run(() => updateFastRange(fast.id, startedAt, endedAt))}
        saveLabel={tc('save')}
        disabled={!validation.ok || busy}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => setConfirmDelete(true)}
        style={({ pressed }) => [styles.delete, { opacity: pressed ? 0.6 : 1 }]}
      >
        <IconTrash size={18} color={colors.accentText} />
        <Text size={15} weight="bold" color="accentText">
          {t('delete')}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
});
