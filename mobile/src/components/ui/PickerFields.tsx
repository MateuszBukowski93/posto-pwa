import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useLocaleInfo } from '@/components/providers/I18nProvider';
import { useColors, useTheme } from '@/components/providers/ThemeProvider';
import { formatTimeOfDay, parseTimeOfDay } from '@/lib/domain/time';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { Text } from './Text';

/**
 * Pola godziny i daty zamiast <input type="time"> / "datetime-local" z wersji web.
 * Android: systemowe okno wyboru. iOS: kółka (spinner) rozwijane pod polem.
 */

type Mode = 'date' | 'time';

function useOpenPicker() {
  const { is24Hour } = useLocaleInfo();
  return (mode: Mode, value: Date, onPick: (date: Date) => void, maximumDate?: Date) => {
    DateTimePickerAndroid.open({
      value,
      mode,
      is24Hour,
      maximumDate,
      onValueChange: (_event, date) => onPick(date),
    });
  };
}

function InlinePicker({
  mode,
  value,
  onPick,
  maximumDate,
}: {
  mode: Mode;
  value: Date;
  onPick: (date: Date) => void;
  maximumDate?: Date;
}) {
  const { formatLocale } = useLocaleInfo();
  const { scheme, colors } = useTheme();
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display="spinner"
      locale={formatLocale}
      themeVariant={scheme}
      textColor={colors.ink}
      maximumDate={maximumDate}
      onValueChange={(_event, date) => onPick(date)}
      style={styles.inline}
    />
  );
}

type FieldButtonProps = {
  label: string;
  value: string;
  onPress: () => void;
  expanded?: boolean;
  large?: boolean;
};

function FieldButton({ label, value, onPress, expanded, large }: FieldButtonProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      accessibilityState={Platform.OS === 'ios' ? { expanded: !!expanded } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        large ? styles.large : styles.compact,
        {
          backgroundColor: colors.bg,
          borderColor: expanded ? colors.accent : colors.line,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        size={large ? 24 : 16}
        display={large}
        weight="bold"
        tabular
        align="center"
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
      >
        {value}
      </Text>
    </Pressable>
  );
}

/**
 * Godzina 'HH:MM' (np. ostatni posiłek, start postu). `left` – treść po lewej stronie pola
 * (etykieta); kółka na iOS rozwijają się pod spodem na całą szerokość.
 */
export function TimeField({
  label,
  value,
  onChange,
  large = false,
  left,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
  left?: ReactNode;
}) {
  const format = useFormatters();
  const openPicker = useOpenPicker();
  const [expanded, setExpanded] = useState(false);
  const tod = parseTimeOfDay(value) ?? { hours: 0, minutes: 0 };
  const date = new Date(2024, 0, 10, tod.hours, tod.minutes);
  const pick = (d: Date) => onChange(formatTimeOfDay(d.getTime()));

  const onPress = () => {
    if (Platform.OS === 'android') openPicker('time', date, pick);
    else setExpanded((e) => !e);
  };

  const button = (
    <FieldButton
      label={label}
      value={format.time(date.getTime())}
      onPress={onPress}
      expanded={expanded}
      large={large}
    />
  );
  return (
    <View style={styles.field}>
      {left ? (
        <View style={styles.labelled}>
          <View style={styles.left}>{left}</View>
          {button}
        </View>
      ) : (
        button
      )}
      {expanded && Platform.OS === 'ios' ? <InlinePicker mode="time" value={date} onPick={pick} /> : null}
    </View>
  );
}

/** Data i godzina (edycja postu z historii, pomiar wagi). */
export function DateTimeField({
  label,
  value,
  onChange,
  maximumDate,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maximumDate?: number;
}) {
  const format = useFormatters();
  const openPicker = useOpenPicker();
  const [expanded, setExpanded] = useState<Mode | null>(null);
  const date = new Date(value);
  const max = maximumDate !== undefined ? new Date(maximumDate) : undefined;

  const merge = (mode: Mode) => (picked: Date) => {
    const next = new Date(value);
    if (mode === 'date') next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    else next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    onChange(next.getTime());
  };

  const open = (mode: Mode) => {
    if (Platform.OS === 'android') openPicker(mode, date, merge(mode), mode === 'date' ? max : undefined);
    else setExpanded((current) => (current === mode ? null : mode));
  };

  return (
    <View style={styles.field}>
      <View style={styles.row}>
        <View style={styles.dateCell}>
          <FieldButton
            label={label}
            value={format.mediumDate(value)}
            onPress={() => open('date')}
            expanded={expanded === 'date'}
          />
        </View>
        <View style={styles.timeCell}>
          <FieldButton
            label={label}
            value={format.time(value)}
            onPress={() => open('time')}
            expanded={expanded === 'time'}
          />
        </View>
      </View>
      {expanded && Platform.OS === 'ios' ? (
        <InlinePicker
          key={expanded}
          mode={expanded}
          value={date}
          onPick={merge(expanded)}
          maximumDate={expanded === 'date' ? max : undefined}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  labelled: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  left: { flex: 1, minWidth: 0 },
  dateCell: { flex: 1.6 },
  timeCell: { flex: 1 },
  large: {
    minHeight: 52,
    minWidth: 140,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: { alignSelf: 'stretch' },
});
