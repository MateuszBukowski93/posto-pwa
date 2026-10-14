import { LandingPage } from '@/components/LandingPage';
import { dictionaries } from '@/lib/dictionaries';

export default function Home() {
  return <LandingPage lang="pl" dict={dictionaries.pl} />;
}
