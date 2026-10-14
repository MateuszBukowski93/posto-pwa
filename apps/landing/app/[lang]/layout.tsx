import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fontClassName } from '@/lib/fonts';
import { dictionaries, hasLocale, locales } from '@/lib/dictionaries';
import '../globals.css';

/** Wersje językowe poza polską (ta jest pod `/`). Zbudowane statycznie, reszta → 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.filter((locale) => locale !== 'pl').map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return {
    title: dictionaries[lang].meta.title,
    description: dictionaries[lang].meta.description,
  };
}

export default async function LangLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang} className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
