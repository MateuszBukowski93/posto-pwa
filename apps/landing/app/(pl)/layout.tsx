import type { Metadata } from 'next';
import { fontClassName } from '@/lib/fonts';
import { dictionaries } from '@/lib/dictionaries';
import '../globals.css';

/** Główny język (polski) – pod `/`. Każdy język ma własny root layout, żeby `<html lang>` był poprawny. */
export const metadata: Metadata = {
  title: dictionaries.pl.meta.title,
  description: dictionaries.pl.meta.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl" className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
