import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Manrope } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import { BOOT_SCRIPT } from '@/lib/bootScript';
import { ANALYTICS_ENABLED, THEME_COLORS } from '@/lib/config';
import './globals.css';

// Bricolage nie ma cyrylicy – dla ukraińskiego nagłówki spadają na font systemowy.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  variable: '--font-bricolage',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-manrope',
  display: 'swap',
});

const description = 'Prosty timer postu przerywanego. Bez logowania, dane zostają na Twoim telefonie.';

export const metadata: Metadata = {
  title: { default: 'Posto', template: '%s · Posto' },
  description,
  applicationName: 'Posto',
  appleWebApp: { capable: true, title: 'Posto', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  other: { 'apple-mobile-web-app-capable': 'yes' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pl" suppressHydrationWarning className={`${bricolage.variable} ${manrope.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <AppProviders>
          <div id="app-root" className="flex min-h-dvh flex-col">
            {children}
          </div>
        </AppProviders>
        {ANALYTICS_ENABLED ? <Analytics /> : null}
      </body>
    </html>
  );
}
