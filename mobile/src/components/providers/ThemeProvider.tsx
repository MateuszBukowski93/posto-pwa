import { createContext, use, useEffect, useMemo, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import type { ThemePreference } from '@/lib/domain/types';
import { PALETTES, type Palette, type Scheme } from '@/lib/theme';

type ThemeValue = { scheme: Scheme; colors: Palette };

const ThemeContext = createContext<ThemeValue>({ scheme: 'light', colors: PALETTES.light });

/**
 * Motyw z ustawień (Jasny / Ciemny / Systemowy). Wymuszony motyw ustawiamy też w Appearance,
 * żeby natywne kontrolki (pickery daty, klawiatura, alerty) miały ten sam wygląd.
 */
export function ThemeProvider({ preference, children }: { preference: ThemePreference; children: ReactNode }) {
  const system = useColorScheme();

  useEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);

  const scheme: Scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const value = useMemo(() => ({ scheme, colors: PALETTES[scheme] }), [scheme]);
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeValue {
  return use(ThemeContext);
}

export function useColors(): Palette {
  return use(ThemeContext).colors;
}
