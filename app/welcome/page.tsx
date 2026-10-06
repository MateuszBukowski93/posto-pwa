import type { Metadata } from 'next';
import { WelcomeScreen } from '@/components/welcome/WelcomeScreen';

export const metadata: Metadata = { title: 'Post przerywany, po prostu' };

export default function WelcomePage() {
  return <WelcomeScreen />;
}
