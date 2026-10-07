import { Tabs } from 'expo-router/js-tabs';
import { useColors } from '@/components/providers/ThemeProvider';
import { BottomNav } from '@/components/ui/BottomNav';

export default function TabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg }, tabBarHideOnKeyboard: true }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="measurements" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
