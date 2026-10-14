import { notFound } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { dictionaries, hasLocale } from '@/lib/dictionaries';

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return <LandingPage lang={lang} dict={dictionaries[lang]} />;
}
