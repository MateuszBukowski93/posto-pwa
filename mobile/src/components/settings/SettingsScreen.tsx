import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useSettings } from '@/components/providers/SettingsProvider';
import { useColors } from '@/components/providers/ThemeProvider';
import { IconChevronRight, IconCoffee, IconGlobe } from '@/components/ui/icons';
import { BORDER, ListGroup, ScreenTitle, SectionLabel } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { isRealUrl, siteConfig } from '@/lib/config';
import { updateSettings } from '@/lib/db/repo';
import type { LocalePreference, ThemePreference } from '@/lib/domain/types';
import { sortWeightsAsc } from '@/lib/domain/weight';
import { LANGUAGE_NAMES } from '@/lib/i18n/languages';
import { useWeights } from '@/lib/hooks/useData';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { DataSection } from './DataSection';
import { WaterGoalSheet, WeightGoalSheet } from './GoalSheets';
import { LanguageSheet } from './LanguageSheet';
import { NotificationsSection } from './NotificationsSection';
import { ValueRow } from './rows';

type SheetKind = 'language' | 'water' | 'weight' | null;

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

export function SettingsScreen() {
  const t = useTranslations('settings');
  const format = useFormatters();
  const colors = useColors();
  const { settings } = useSettings();
  const weights = useWeights();
  const [sheet, setSheet] = useState<SheetKind>(null);

  const firstWeight = weights ? sortWeightsAsc(weights)[0]?.kg : undefined;
  const currentLanguage = settings.locale === 'system' ? t('languageSystem') : LANGUAGE_NAMES[settings.locale];
  const supportUrl = siteConfig.buyMeACoffeeUrl;
  const supportEnabled = isRealUrl(supportUrl);

  const selectLanguage = async (locale: LocalePreference) => {
    await updateSettings({ locale });
    setSheet(null);
  };

  return (
    <Screen gap={12} paddingBottom={20}>
      <View style={styles.header}>
        <ScreenTitle>{t('title')}</ScreenTitle>
      </View>

      <NotificationsSection />

      <View style={styles.section}>
        <SectionLabel>{t('appearance')}</SectionLabel>
        <SegmentedControl<ThemePreference>
          label={t('theme')}
          value={settings.theme}
          onChange={(theme) => void updateSettings({ theme })}
          options={[
            { value: 'light', label: t('themeLight') },
            { value: 'dark', label: t('themeDark') },
            { value: 'system', label: t('themeSystem') },
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('language')}, ${currentLanguage}`}
          onPress={() => setSheet('language')}
          style={({ pressed }) => [
            styles.language,
            { backgroundColor: colors.surface, borderColor: colors.line, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.languageLabel}>
            <IconGlobe size={20} />
            <Text size={14} weight="semibold">
              {t('language')}
            </Text>
          </View>
          <View style={styles.languageValue}>
            <Text size={14} color="muted">
              {currentLanguage}
            </Text>
            <IconChevronRight size={18} color={colors.muted} />
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <SectionLabel>{t('goals')}</SectionLabel>
        <ListGroup>
          <ValueRow onPress={() => router.push('/protocol')} label={t('protocol')} value={settings.protocolId} />
          <ValueRow
            onPress={() => setSheet('water')}
            label={t('waterGoal')}
            value={format.liters(settings.waterGoalMl)}
          />
          <ValueRow
            onPress={() => setSheet('weight')}
            label={t('weightGoal')}
            value={settings.weightGoalKg !== undefined ? format.kg(settings.weightGoalKg) : t('notSet')}
          />
        </ListGroup>
      </View>

      <DataSection />

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="link"
          accessibilityState={{ disabled: !supportEnabled }}
          disabled={!supportEnabled}
          onPress={() => void WebBrowser.openBrowserAsync(supportUrl)}
          style={[
            styles.support,
            {
              borderColor: colors.line,
              backgroundColor: supportEnabled ? colors.surface : 'transparent',
              borderStyle: supportEnabled ? 'solid' : 'dashed',
            },
          ]}
        >
          <IconCoffee size={18} color={supportEnabled ? colors.ink : colors.muted} />
          <Text size={14} weight="bold" color={supportEnabled ? 'ink' : 'muted'}>
            {t('support')}
          </Text>
        </Pressable>
        <View accessibilityLabel={t('footerLabel')} style={styles.links}>
          <Pressable accessibilityRole="link" onPress={() => router.push('/terms')} style={styles.link}>
            <Text size={13} weight="bold" underline>
              {t('terms')}
            </Text>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')} style={styles.link}>
            <Text size={13} weight="bold" underline>
              {t('privacy')}
            </Text>
          </Pressable>
        </View>
        <Text size={12} color="muted" tabular>
          {t('version', { version: APP_VERSION })}
        </Text>
      </View>

      <LanguageSheet
        open={sheet === 'language'}
        value={settings.locale}
        onClose={() => setSheet(null)}
        onSelect={(value) => void selectLanguage(value)}
      />
      <WaterGoalSheet open={sheet === 'water'} value={settings.waterGoalMl} onClose={() => setSheet(null)} />
      <WeightGoalSheet
        open={sheet === 'weight'}
        goalKg={settings.weightGoalKg}
        startKg={settings.startWeightKg}
        firstMeasurementKg={firstWeight}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 48, justifyContent: 'center' },
  section: { gap: 6 },
  language: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 52,
    marginTop: 2,
    borderRadius: 16,
    borderWidth: BORDER,
    paddingVertical: 6,
    paddingLeft: 16,
    paddingRight: 12,
  },
  languageLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  languageValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footer: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  support: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: BORDER,
    paddingHorizontal: 16,
  },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
});
