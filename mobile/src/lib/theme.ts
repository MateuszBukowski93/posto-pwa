/** Tokeny wizualne – te same wartości co w wersji PWA (apps/pwa/app/globals.css, sekcja 4 specyfikacji). */

const light = {
  bg: '#F2F4F1',
  surface: '#FFFFFF',
  line: '#DCE2DD',
  track: '#E3E8E4',
  below: '#BCC6BF',
  off: '#AEB8B1',
  ink: '#141B18',
  muted: '#56615B',
  accent: '#E8673A',
  accentText: '#B0441C',
  accentSoft: '#FBE4DA',
  water: '#2F7FC1',
  waterBtn: '#226BA8',
  waterText: '#1F5F96',
  waterSoft: '#DDEBF7',
  waterEmpty: '#C2DAEE',
  btn: '#141B18',
  btnText: '#FFFFFF',
  segOn: '#FFFFFF',
  overlay: 'rgba(8, 12, 10, 0.5)',
  shadow: '#141B18',
};

export type Palette = typeof light;
export type ColorToken = keyof Palette;

const dark: Palette = {
  bg: '#0E1311',
  surface: '#171E1B',
  line: '#26302C',
  track: '#232C28',
  below: '#4A5650',
  off: '#4A5650',
  ink: '#EDF1EE',
  muted: '#9BA7A1',
  accent: '#F0784C',
  accentText: '#F5916B',
  accentSoft: '#33221A',
  water: '#3D8FD1',
  waterBtn: '#2F7FC1',
  waterText: '#7DB8EA',
  waterSoft: '#14273A',
  waterEmpty: '#1F3A52',
  btn: '#EDF1EE',
  btnText: '#0E1311',
  segOn: '#2E3934',
  overlay: 'rgba(8, 12, 10, 0.5)',
  shadow: '#000000',
};

export const PALETTES = { light, dark } as const;

export type Scheme = keyof typeof PALETTES;

/** Rodziny fontów (ładowane w app/_layout.tsx). Bricolage nie ma cyrylicy – system dobiera zapasowy font. */
export const FONTS = {
  display: 'BricolageGrotesque_700Bold',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/** Kolumna treści na szerszych ekranach (tablety). */
export const MAX_CONTENT_WIDTH = 480;
export const SCREEN_PADDING = 20;
