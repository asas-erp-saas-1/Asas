import React from 'react';
import { Metadata } from 'next';
import { ReconciliationModule } from '@/modules/dashboard/components/ReconciliationModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Banque & Réconciliation — ASAS OS',
}

export default async function ReconciliationPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <ReconciliationModule />
    </div>
  );
}
