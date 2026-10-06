import type { ReactNode, SVGProps } from 'react';

/** Ikony obrysowe w stylu makiet (ścieżki przeniesione z plików design/). */

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number; strokeWidth?: number };

function Svg({ size = 24, strokeWidth = 1.9, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconTimer = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 10v3.5l2.5 2M9.5 3h5" />
  </Svg>
);

export const IconHistory = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);

export const IconMeasurements = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 19.5h16M5.5 15l4-5 3.5 3 5.5-7" />
  </Svg>
);

export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h9M18 7h2M4 17h2M11 17h9" />
    <circle cx="15.5" cy="7" r="2.5" />
    <circle cx="8.5" cy="17" r="2.5" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconMinus = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M5 12h14" />
  </Svg>
);

export const IconPencil = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2" />
  </Svg>
);

export const IconDrop = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M12 3.5c3.2 3.7 5.5 6.9 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2.9 2.3-6.1 5.5-9.8z" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2" />
  </Svg>
);

export const IconPhoneDownload = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M12 7.5v7M9 11.5l3 3 3-3" />
  </Svg>
);

export const IconGift = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="9" width="16" height="11.5" rx="2" />
    <path d="M12 9v11.5M3.5 9h17M12 9C10.5 5.5 6.5 5 6.5 7.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z" />
  </Svg>
);

export const IconPhone = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Svg>
);

export const IconGlobe = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5z" />
  </Svg>
);

export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5v11M8 7.5l4-4 4 4M7 11H5.5v9.5h13V11H17" />
  </Svg>
);

export const IconAddSquare = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 3.5h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2zM12 8v8M8 12h8" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const IconDash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 12h12" />
  </Svg>
);

export const IconDots = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5.5h.01M12 12h.01M12 18.5h.01" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14" />
  </Svg>
);

export const IconUpload = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 11v5M14 11v5" />
  </Svg>
);

export const IconWarning = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M12 4.5l8.5 15h-17L12 4.5zM12 10.5v4M12 17.2h.01" />
  </Svg>
);

export const IconCoffee = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9.5zM16 11h1.5a2.5 2.5 0 0 1 0 5H16M8.5 3.5V6M12 3.5V6" />
  </Svg>
);
