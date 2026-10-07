import type { Metadata } from 'next';
import { LegalScreen } from '@/components/legal/LegalScreen';
import { loadLegalDocuments } from '@/lib/legal/load';

export const metadata: Metadata = { title: 'Regulamin' };

export default function TermsPage() {
  return <LegalScreen documents={loadLegalDocuments('terms')} />;
}
