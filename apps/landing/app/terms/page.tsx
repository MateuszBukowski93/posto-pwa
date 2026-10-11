import type { Metadata } from 'next';
import { LegalPage } from '../legal';

export const metadata: Metadata = { title: 'Regulamin – Posto' };

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
