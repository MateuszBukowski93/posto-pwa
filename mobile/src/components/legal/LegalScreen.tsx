import { StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useLocaleInfo } from '@/components/providers/I18nProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { BackHeader } from '@/components/ui/BackHeader';
import { IconInfo } from '@/components/ui/icons';
import { Notice } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { loadLegalDocument, type LegalKind } from '@/lib/legal/load';
import type { LegalBlock } from '@/lib/legal/markdown';

function Block({ block, lang }: { block: LegalBlock; lang: string }) {
  const colors = useColors();
  if (block.type !== 'p') {
    return (
      <View style={styles.list}>
        {block.items.map((item, index) => (
          <View key={item} style={styles.listItem}>
            <Text size={14} leading={1.55} style={styles.bullet}>
              {block.type === 'ol' ? `${index + 1}.` : '•'}
            </Text>
            <Text size={14} leading={1.55} style={styles.flex} accessibilityLanguage={lang}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    );
  }
  if (block.note) {
    return (
      <View style={[styles.note, { borderColor: colors.muted }]}>
        <Text size={13} leading={1.55} color="muted" accessibilityLanguage={lang}>
          {block.text}
        </Text>
      </View>
    );
  }
  return (
    <Text size={14} leading={1.55} accessibilityLanguage={lang}>
      {block.text}
    </Text>
  );
}

/** Regulamin / Polityka prywatności. Polska wersja jest wiążąca, inne języki widzą angielską. */
export function LegalScreen({ kind }: { kind: LegalKind }) {
  const t = useTranslations('legal');
  const colors = useColors();
  const { locale } = useLocaleInfo();
  const { settings } = useSettings();
  const docLocale = locale === 'pl' ? 'pl' : 'en';
  const doc = loadLegalDocument(kind, docLocale);

  return (
    <Screen gap={22} paddingBottom={48} bottomInset>
      <BackHeader fallback={settings.onboardingDone ? '/settings' : '/welcome'} label={t('back')} />

      <View style={styles.head}>
        <Text
          display
          size={32}
          leading={1.1}
          tracking={-0.03}
          accessibilityRole="header"
          accessibilityLanguage={docLocale}
        >
          {doc.title}
        </Text>
        <Text size={13} color="muted">
          {doc.meta}
        </Text>
      </View>

      {locale !== 'pl' ? (
        <Notice icon={<IconInfo size={20} color={colors.waterText} />}>{t('bindingNote')}</Notice>
      ) : null}

      {doc.sections.map((section) => (
        <View
          key={section.heading}
          style={[section.highlight ? [styles.highlight, { backgroundColor: colors.accentSoft }] : styles.section]}
        >
          <Text display size={19} tracking={-0.02} accessibilityRole="header" accessibilityLanguage={docLocale}>
            {section.heading}
          </Text>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} lang={docLocale} />
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { gap: 6 },
  section: { gap: 8 },
  highlight: { gap: 10, borderRadius: 18, padding: 16 },
  list: { gap: 6 },
  listItem: { flexDirection: 'row', gap: 8 },
  bullet: { minWidth: 16 },
  note: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
});
