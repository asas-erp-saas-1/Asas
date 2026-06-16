import React from 'react';
import { Metadata } from 'next';
import { DelaysRisksModule } from '@/modules/dashboard/components/DelaysRisksModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Delays & Risks — ASAS OS',
}

export default async function DelaysRisksPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <DelaysRisksModule />
    </div>
  );
}
