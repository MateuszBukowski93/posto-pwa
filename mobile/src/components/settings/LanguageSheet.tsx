import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useLocaleInfo } from '@/components/providers/I18nProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { IconCheck } from '@/components/ui/icons';
import { BORDER } from '@/components/ui/layout';
import { Text } from '@/components/ui/Text';
import type { LocalePreference } from '@/lib/domain/types';
import { LANGUAGE_NAMES, languageName } from '@/lib/i18n/languages';

const OPTIONS: LocalePreference[] = ['system', 'pl', 'en', 'de', 'es', 'fr', 'it', 'pt', 'uk'];

type Props = {
  open: boolean;
  value: LocalePreference;
  onClose: () => void;
  onSelect: (value: LocalePreference) => void;
};

export function LanguageSheet({ open, value, onClose, onSelect }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} gap={14}>
      <LanguageList value={value} onSelect={onSelect} />
    </BottomSheet>
  );
}

function LanguageList({ value, onSelect }: Pick<Props, 'value' | 'onSelect'>) {
  const t = useTranslations('settings');
  const { locale, systemLocale } = useLocaleInfo();
  const colors = useColors();

  return (
    <>
      <SheetHeader title={t('language')} />
      <View accessibilityRole="radiogroup" style={[styles.list, { borderColor: colors.line }]}>
        {OPTIONS.map((option, index) => {
          const selected = option === value;
          const native = option === 'system' ? t('languageSystem') : LANGUAGE_NAMES[option];
          const sub =
            option === 'system'
              ? t('languageSystemSub', { language: languageName(systemLocale, locale) })
              : languageName(option, locale);
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLanguage={option === 'system' ? undefined : option}
              onPress={() => onSelect(option)}
              style={({ pressed }) => [
                styles.row,
                index > 0 && { borderTopWidth: BORDER, borderTopColor: colors.line },
                { backgroundColor: selected ? colors.accentSoft : 'transparent', opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={styles.text}>
                <Text size={15} weight="bold">
                  {native}
                </Text>
                <Text size={12} color="muted">
                  {sub}
                </Text>
              </View>
              <View style={[styles.check, { backgroundColor: selected ? colors.accent : 'transparent' }]}>
                {selected ? <IconCheck size={14} strokeWidth={3} color="#FFFFFF" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: 18, borderWidth: BORDER, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  text: { flex: 1, gap: 1 },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
