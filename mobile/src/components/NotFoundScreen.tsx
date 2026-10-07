import { router } from 'expo-router';
import { useTranslations } from 'use-intl';
import { Button } from '@/components/ui/Button';
import { ScreenTitle } from '@/components/ui/layout';
import { Screen, Spacer } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';

export function NotFoundScreen() {
  const t = useTranslations('notFound');
  return (
    <Screen gap={12} paddingBottom={24} bottomInset>
      <Text display size={26} tracking={-0.03}>
        Posto
      </Text>
      <ScreenTitle>{t('title')}</ScreenTitle>
      <Text size={14} leading={1.45} color="muted">
        {t('description')}
      </Text>
      <Spacer />
      <Button onPress={() => router.replace('/')}>{t('home')}</Button>
    </Screen>
  );
}
