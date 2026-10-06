import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { SheetActions } from '@/components/timer/FastSheets';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { IconTrash } from '@/components/ui/icons';
import { DateTimeField } from '@/components/ui/PickerFields';
import { Text } from '@/components/ui/Text';
import { addWeight, deleteWeight, updateWeight } from '@/lib/db/repo';
import type { WeightEntry } from '@/lib/domain/types';
import { KG_MAX, KG_MIN, parseKg } from '@/lib/domain/weight';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { FONTS } from '@/lib/theme';

export type WeightSheetState =
  { mode: 'add'; openedAt: number } | { mode: 'edit'; entry: WeightEntry; openedAt: number } | null;

export function WeightSheet({ state, onClose }: { state: WeightSheetState; onClose: () => void }) {
  return (
    <BottomSheet open={state !== null} onClose={onClose}>
      {state ? <WeightSheetBody state={state} onClose={onClose} /> : null}
    </BottomSheet>
  );
}

const floorMinute = (ts: number) => Math.floor(ts / 60_000) * 60_000;

function WeightSheetBody({ state, onClose }: { state: NonNullable<WeightSheetState>; onClose: () => void }) {
  const t = useTranslations('weightSheet');
  const tc = useTranslations('common');
  const format = useFormatters();
  const colors = useColors();
  const editing = state.mode === 'edit' ? state.entry : null;
  const [kgText, setKgText] = useState(() => (editing ? format.number(editing.kg, 1) : ''));
  const [at, setAt] = useState(() => floorMinute(editing?.at ?? state.openedAt));
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const kg = parseKg(kgText);
  const valid = kg !== null;
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
    if (kg === null || busy) return;
    void run(() => (editing ? updateWeight(editing.id, kg, at) : addWeight(kg, at)));
  };

  if (editing && confirmDelete) {
    return (
      <>
        <SheetHeader
          title={t('deleteTitle')}
          description={t('deleteDescription', { value: format.kg(editing.kg, true) })}
        />
        <SheetActions
          onCancel={() => setConfirmDelete(false)}
          onSave={() => void run(() => deleteWeight(editing.id))}
          saveLabel={t('deleteConfirm')}
          disabled={busy}
          danger
        />
      </>
    );
  }

  return (
    <>
      <SheetHeader title={editing ? t('editTitle') : t('addTitle')} />
      <View style={styles.field}>
        <Text size={13} weight="bold" color="muted">
          {t('kgLabel')}
        </Text>
        <View>
          <TextInput
            autoFocus={!editing}
            accessibilityLabel={t('kgLabel')}
            keyboardType="decimal-pad"
            returnKeyType="done"
            autoComplete="off"
            placeholder={format.number(75.5, 1)}
            placeholderTextColor={colors.muted}
            value={kgText}
            onChangeText={setKgText}
            onBlur={() => setTouched(true)}
            onSubmitEditing={save}
            maxFontSizeMultiplier={1.2}
            style={[
              styles.input,
              {
                backgroundColor: colors.bg,
                borderColor: showError ? colors.accentText : colors.line,
                color: colors.ink,
              },
            ]}
          />
          <Text size={16} weight="bold" color="muted" style={styles.unit} importantForAccessibility="no">
            kg
          </Text>
        </View>
        {showError ? (
          <Text size={13} weight="bold" color="accentText" accessibilityLiveRegion="assertive">
            {t('kgError', { min: KG_MIN, max: KG_MAX })}
          </Text>
        ) : null}
      </View>
      <View style={styles.field}>
        <Text size={13} weight="bold" color="muted">
          {t('dateLabel')}
        </Text>
        <DateTimeField label={t('dateLabel')} value={at} onChange={setAt} />
      </View>
      <SheetActions onCancel={onClose} onSave={save} saveLabel={tc('save')} disabled={(touched && !valid) || busy} />
      {editing ? (
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
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingRight: 48,
    fontFamily: FONTS.display,
    fontSize: 24,
    fontVariant: ['tabular-nums'],
  },
  unit: { position: 'absolute', right: 16, top: 0, bottom: 0, textAlignVertical: 'center', lineHeight: 52 },
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
