import '@/lib/i18n/polyfills';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '@/components/providers/I18nProvider';
import { NotificationsManager } from '@/components/providers/NotificationsManager';
import { useSettings } from '@/components/providers/SettingsProvider';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';
import { StartupError } from '@/components/StartupError';
import { DATABASE_NAME } from '@/lib/config';
import { initDatabase } from '@/lib/db';
import { openExpoDatabase } from '@/lib/db/expo';
import { loadSettings } from '@/lib/db/repo';

void SplashScreen.preventAutoHideAsync();

type DbState = 'loading' | 'ready' | 'error';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const [db, setDb] = useState<DbState>('loading');
  const { settings } = useSettings();

  useEffect(() => {
    initDatabase(() => openExpoDatabase(DATABASE_NAME))
      .then(loadSettings)
      .then(
        () => setDb('ready'),
        (error: unknown) => {
          if (__DEV__) console.error('Database init failed', error);
          setDb('error');
        },
      );
  }, []);

  // Brak fontu nie blokuje aplikacji – zostaje systemowy.
  const ready = (fontsLoaded || fontError !== null) && db !== 'loading';

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider preference={settings.theme}>
        <I18nProvider preference={settings.locale}>
          {db === 'ready' ? <AppNavigator onboardingDone={settings.onboardingDone} /> : <StartupError />}
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Pierwsze uruchomienie: dostępne jest Powitanie, a Timer (zakładki) dopiero po zapisaniu
 * protokołu. Usunięcie wszystkich danych odwraca warunki i router sam wraca do Powitania.
 */
function AppNavigator({ onboardingDone }: { onboardingDone: boolean }) {
  const { scheme, colors } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Protected guard={onboardingDone}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!onboardingDone}>
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        </Stack.Protected>
        <Stack.Screen name="protocol" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
      </Stack>
      <NotificationsManager />
    </>
  );
}
