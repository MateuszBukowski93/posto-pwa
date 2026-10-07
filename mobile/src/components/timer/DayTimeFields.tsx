import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { IconClock } from '@/components/ui/icons';
import { TimeField } from '@/components/ui/PickerFields';
import { Text } from '@/components/ui/Text';
import { addLocalDays, formatTimeOfDay, localDayDiff } from '@/lib/domain/time';
import { useFormatters } from '@/lib/hooks/useFormatters';

export type DayOffset = 0 | 1 | 2;
export type DayTimeDraft = { dayOffset: DayOffset; time: string };

const OFFSETS: readonly DayOffset[] = [2, 1, 0];

export function draftFromTimestamp(ts: number, reference: number): DayTimeDraft {
  const diff = Math.min(2, Math.max(0, localDayDiff(ts, reference))) as DayOffset;
  return { dayOffset: diff, time: formatTimeOfDay(ts) };
}

/** Wybór dnia (Przedwczoraj / Wczoraj / Dziś) i godziny – wspólny dla startu i końca postu. */
export function DayTimeFields({
  draft,
  onChange,
  now,
}: {
  draft: DayTimeDraft;
  onChange: (draft: DayTimeDraft) => void;
  now: number;
}) {
  const t = useTranslations('dayTime');
  const tc = useTranslations('common');
  const format = useFormatters();
  const colors = useColors();
  const labels: Record<DayOffset, string> = { 2: tc('dayBeforeYesterday'), 1: tc('yesterday'), 0: tc('today') };

  return (
    <>
      <View style={styles.group}>
        <Text size={13} weight="bold" color="muted">
          {t('day')}
        </Text>
        <View accessibilityRole="radiogroup" accessibilityLabel={t('day')} style={styles.days}>
          {OFFSETS.map((offset) => {
            const selected = offset === draft.dayOffset;
            return (
              <Pressable
                key={offset}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => onChange({ ...draft, dayOffset: offset })}
                style={[
                  styles.day,
                  {
                    borderColor: selected ? colors.accent : colors.line,
                    backgroundColor: selected ? colors.accentSoft : 'transparent',
                  },
                ]}
              >
                <Text size={14} weight="bold" align="center" numberOfLines={1}>
                  {labels[offset]}
                </Text>
                <Text size={12} color="muted" tabular>
                  {format.shortDate(addLocalDays(now, -offset))}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <TimeField
        large
        label={t('time')}
        value={draft.time}
        onChange={(time) => onChange({ ...draft, time })}
        left={
          <Text size={13} weight="bold" color="muted">
            {t('time')}
          </Text>
        }
      />
    </>
  );
}

/** Podgląd na żywo pod polami (ogłaszany czytnikowi ekranu). */
export function StatusNote({ valid, children }: { valid: boolean; children: ReactNode }) {
  const colors = useColors();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.note, { backgroundColor: valid ? colors.accentSoft : colors.track }]}
    >
      <IconClock size={18} color={valid ? colors.accentText : colors.ink} />
      <Text size={14} weight="bold" leading={1.35} color={valid ? 'accentText' : 'ink'} style={styles.noteText}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  days: { flexDirection: 'row', gap: 8 },
  day: {
    flex: 1,
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteText: { flex: 1 },
});
