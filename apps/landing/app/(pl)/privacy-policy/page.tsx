import type { Metadata } from 'next';
import { LegalPage } from '../../legal';

export const metadata: Metadata = { title: 'Polityka prywatności – Posto' };

export default function PrivacyPolicyPage() {
  return <LegalPage kind="privacy" />;
}
