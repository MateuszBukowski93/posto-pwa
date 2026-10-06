import type { Metadata } from 'next';
import { LegalScreen } from '@/components/legal/LegalScreen';
import { loadLegalDocuments } from '@/lib/legal/load';

export const metadata: Metadata = { title: 'Polityka prywatności' };

export default function PrivacyPage() {
  return <LegalScreen documents={loadLegalDocuments('privacy')} />;
}
