import type { Metadata } from 'next';
import { HistoryScreen } from '@/components/history/HistoryScreen';

export const metadata: Metadata = { title: 'Historia' };

export default function HistoryPage() {
  return <HistoryScreen />;
}
