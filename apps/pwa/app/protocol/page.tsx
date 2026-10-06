import type { Metadata } from 'next';
import { ProtocolScreen } from '@/components/protocol/ProtocolScreen';

export const metadata: Metadata = { title: 'Protokół postu' };

export default function ProtocolPage() {
  return <ProtocolScreen />;
}
