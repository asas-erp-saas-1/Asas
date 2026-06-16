import { Metadata } from 'next';
import { LandingContent } from './LandingContent';

export const metadata: Metadata = {
  title: 'ASAS RE-OS — Le Système d\'Exploitation Immobilier',
  description: 'Un ERP/CRM ultra-performant conçu spécifiquement pour les agences immobilières modernes.',
};

export default function LandingPage() {
  return <LandingContent />;
}


