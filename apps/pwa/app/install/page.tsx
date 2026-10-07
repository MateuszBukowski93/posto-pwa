import type { Metadata } from 'next';
import { InstallScreen } from '@/components/install/InstallScreen';

export const metadata: Metadata = { title: 'Zainstaluj Posto' };

export default function InstallPage() {
  return <InstallScreen />;
}
