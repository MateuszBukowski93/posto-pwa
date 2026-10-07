import { useTranslations } from 'use-intl';
import { ScreenTitle } from '@/components/ui/layout';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

/** Baza danych nie dała się otworzyć (np. brak miejsca na urządzeniu). */
export function StartupError() {
  const t = useTranslations('common');
  return (
    <Screen gap={12}>
      <Text display size={26} tracking={-0.03}>
        Posto
      </Text>
      <ScreenTitle>{t('error')}</ScreenTitle>
    </Screen>
  );
}
