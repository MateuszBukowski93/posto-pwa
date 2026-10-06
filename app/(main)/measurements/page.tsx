import type { Metadata } from 'next';
import { MeasurementsScreen } from '@/components/measurements/MeasurementsScreen';

export const metadata: Metadata = { title: 'Pomiary' };

export default function MeasurementsPage() {
  return <MeasurementsScreen />;
}
