import type { ReactNode } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { useColors } from '@/components/providers/ThemeProvider';

/** Ikony obrysowe w stylu makiet (ścieżki z plików design/, jak w wersji PWA). */

export type IconProps = { size?: number; strokeWidth?: number; color?: string };

function Icon({ size = 24, strokeWidth = 1.9, color, children }: IconProps & { children: ReactNode }) {
  const colors = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
      <G
        fill="none"
        stroke={color ?? colors.ink}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </G>
    </Svg>
  );
}

export const IconTimer = (p: IconProps) => (
  <Icon {...p}>
    <Circle cx="12" cy="13.5" r="7.5" />
    <Path d="M12 10v3.5l2.5 2M9.5 3h5" />
  </Icon>
);

export const IconHistory = (p: IconProps) => (
  <Icon {...p}>
    <Rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <Path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
);

export const IconMeasurements = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4 19.5h16M5.5 15l4-5 3.5 3 5.5-7" />
  </Icon>
);

export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4 7h9M18 7h2M4 17h2M11 17h9" />
    <Circle cx="15.5" cy="7" r="2.5" />
    <Circle cx="8.5" cy="17" r="2.5" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="M6 9l6 6 6-6" />
  </Icon>
);

export const IconChevronLeft = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="M15 5l-7 7 7 7" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="M9 6l6 6-6 6" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconMinus = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <Path d="M5 12h14" />
  </Icon>
);

export const IconPencil = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  </Icon>
);

export const IconClock = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Circle cx="12" cy="13" r="8" />
    <Path d="M12 9v4l2.5 2" />
  </Icon>
);

export const IconDrop = (p: IconProps) => (
  <Icon strokeWidth={2.2} {...p}>
    <Path d="M12 3.5c3.2 3.7 5.5 6.9 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2.9 2.3-6.1 5.5-9.8z" />
  </Icon>
);

export const IconLock = (p: IconProps) => (
  <Icon {...p}>
    <Rect x="5" y="11" width="14" height="9.5" rx="2.5" />
    <Path d="M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2" />
  </Icon>
);

export const IconOffline = (p: IconProps) => (
  <Icon {...p}>
    <Rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <Path d="M11 18.5h2M9.5 9.5l5 5M14.5 9.5l-5 5" />
  </Icon>
);

export const IconGift = (p: IconProps) => (
  <Icon {...p}>
    <Rect x="4" y="9" width="16" height="11.5" rx="2" />
    <Path d="M12 9v11.5M3.5 9h17M12 9C10.5 5.5 6.5 5 6.5 7.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z" />
  </Icon>
);

export const IconGlobe = (p: IconProps) => (
  <Icon {...p}>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5z" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const IconDash = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M6 12h12" />
  </Icon>
);

export const IconDownload = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" />
  </Icon>
);

export const IconUpload = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14" />
  </Icon>
);

export const IconInfo = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M12 11v5M12 8h.01" />
  </Icon>
);

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 11v5M14 11v5" />
  </Icon>
);

export const IconWarning = (p: IconProps) => (
  <Icon strokeWidth={2} {...p}>
    <Path d="M12 4.5l8.5 15h-17L12 4.5zM12 10.5v4M12 17.2h.01" />
  </Icon>
);

export const IconCoffee = (p: IconProps) => (
  <Icon {...p}>
    <Path d="M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9.5zM16 11h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5V6M12 3.5V6" />
  </Icon>
);
