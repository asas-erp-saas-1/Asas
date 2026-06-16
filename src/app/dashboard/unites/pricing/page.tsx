import React from 'react';
import { Metadata } from 'next';
import { PricingEngineModule } from '@/modules/dashboard/components/PricingEngineModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing Engine — ASAS OS',
  description: 'AI Yield Management & Pricing',
}

export default async function PricingPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <PricingEngineModule />
    </div>
  );
}
